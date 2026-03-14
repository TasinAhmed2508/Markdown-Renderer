/**
 * CSV Table Module
 * Renders csv/tsv code blocks as sortable HTML tables
 */

/**
 * Parse a CSV line into fields, respecting quoted fields.
 * Handles: commas inside quotes, escaped quotes (""), empty cells.
 * @param {string} line - A single CSV line
 * @param {string} delimiter - Field delimiter (',' or '\t')
 * @returns {string[]} Array of field values
 */
function parseLine(line, delimiter) {
    const fields = [];
    let i = 0;
    const len = line.length;

    while (i <= len) {
        if (i === len) {
            fields.push('');
            break;
        }

        if (line[i] === '"') {
            // Quoted field
            let value = '';
            i++; // skip opening quote
            while (i < len) {
                if (line[i] === '"') {
                    if (i + 1 < len && line[i + 1] === '"') {
                        // Escaped quote
                        value += '"';
                        i += 2;
                    } else {
                        // Closing quote
                        i++; // skip closing quote
                        break;
                    }
                } else {
                    value += line[i];
                    i++;
                }
            }
            fields.push(value);
            // Skip delimiter after quoted field
            if (i < len && line[i] === delimiter) i++;
        } else {
            // Unquoted field
            const nextDelim = line.indexOf(delimiter, i);
            if (nextDelim === -1) {
                fields.push(line.substring(i));
                break;
            } else {
                fields.push(line.substring(i, nextDelim));
                i = nextDelim + 1;
                // Trailing delimiter means one more empty field
                if (i === len) {
                    fields.push('');
                    break;
                }
            }
        }
    }

    return fields;
}

/**
 * Parse full CSV/TSV text into a 2D array of strings.
 * @param {string} text - CSV/TSV content
 * @param {string} delimiter - ',' or '\t'
 * @returns {string[][]} Parsed rows
 */
function parseCSV(text, delimiter) {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const rows = [];

    for (const line of lines) {
        if (line.trim() === '') continue;
        rows.push(parseLine(line, delimiter));
    }

    return rows;
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Build a sortable HTML table from parsed CSV data.
 * @param {string[][]} rows - Parsed data rows
 * @returns {HTMLElement} Table wrapper element
 */
function buildTable(rows) {
    if (rows.length === 0) return document.createElement('div');

    const wrapper = document.createElement('div');
    wrapper.className = 'csv-table-wrapper';
    wrapper.style.cssText = 'overflow-x:auto;margin:16px 0;';

    const table = document.createElement('table');
    table.className = 'csv-table';
    table.style.cssText = 'border-collapse:collapse;width:100%;font-size:0.9em;';

    // Header from first row
    const headerRow = rows[0];
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    // Track sort state per column
    const sortState = { col: -1, asc: true };

    headerRow.forEach((cell, colIdx) => {
        const th = document.createElement('th');
        th.style.cssText = 'padding:8px 12px;border:1px solid var(--border-color,#ddd);background:var(--table-header-bg,#f5f5f5);text-align:left;cursor:pointer;user-select:none;white-space:nowrap;';
        th.innerHTML = escapeHtml(cell) + ' <span class="sort-indicator" style="opacity:0.4;font-size:0.75em;">⇅</span>';
        th.title = 'Click to sort';

        th.addEventListener('click', () => {
            const asc = (sortState.col === colIdx) ? !sortState.asc : true;
            sortState.col = colIdx;
            sortState.asc = asc;
            sortTable(table, colIdx, asc);

            // Update indicators
            thead.querySelectorAll('.sort-indicator').forEach(s => {
                s.textContent = '⇅';
                s.style.opacity = '0.4';
            });
            const indicator = th.querySelector('.sort-indicator');
            indicator.textContent = asc ? '▲' : '▼';
            indicator.style.opacity = '1';
        });

        tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);

    // Body rows
    const tbody = document.createElement('tbody');
    const maxCols = headerRow.length;

    for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const bodyTr = document.createElement('tr');

        // Zebra striping
        if ((r - 1) % 2 === 1) {
            bodyTr.style.background = 'var(--table-stripe-bg, rgba(0,0,0,0.03))';
        }

        for (let c = 0; c < maxCols; c++) {
            const td = document.createElement('td');
            td.style.cssText = 'padding:6px 12px;border:1px solid var(--border-color,#ddd);';
            td.textContent = (c < row.length) ? row[c] : '';
            bodyTr.appendChild(td);
        }
        tbody.appendChild(bodyTr);
    }
    table.appendChild(tbody);
    wrapper.appendChild(table);

    return wrapper;
}

/**
 * Sort table body rows by a column.
 */
function sortTable(table, colIdx, ascending) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => {
        const aText = (a.children[colIdx]?.textContent || '').trim();
        const bText = (b.children[colIdx]?.textContent || '').trim();

        // Try numeric comparison first
        const aNum = Number(aText);
        const bNum = Number(bText);
        if (!isNaN(aNum) && !isNaN(bNum) && aText !== '' && bText !== '') {
            return ascending ? aNum - bNum : bNum - aNum;
        }

        // String comparison
        const cmp = aText.localeCompare(bText, undefined, { numeric: true, sensitivity: 'base' });
        return ascending ? cmp : -cmp;
    });

    // Reapply zebra striping
    rows.forEach((row, i) => {
        row.style.background = (i % 2 === 1) ? 'var(--table-stripe-bg, rgba(0,0,0,0.03))' : '';
        tbody.appendChild(row);
    });
}

/**
 * Find and replace csv/tsv code blocks with rendered tables.
 * @param {HTMLElement} element - DOM element to process
 */
export function renderCSVTables(element) {
    if (!element) return;

    const blocks = element.querySelectorAll(
        'pre code.language-csv, pre code.language-tsv'
    );

    blocks.forEach(block => {
        const pre = block.closest('pre');
        if (!pre) return;

        const isTSV = block.classList.contains('language-tsv');
        const delimiter = isTSV ? '\t' : ',';
        const content = block.textContent || '';

        const rows = parseCSV(content, delimiter);
        if (rows.length === 0) return;

        const tableEl = buildTable(rows);
        pre.replaceWith(tableEl);
    });
}
