/**
 * Emoji Module
 * Replaces :shortcode: patterns with unicode emoji before markdown parsing
 */

const EMOJI_MAP = {
    // Smileys & People
    smile: '😄', laugh: '😂', joy: '😂', grinning: '😀', grin: '😁',
    wink: '😉', blush: '😊', heart_eyes: '😍', kissing: '😗',
    kissing_heart: '😘', thinking: '🤔', neutral: '😐', expressionless: '😑',
    unamused: '😒', sweat: '😓', pensive: '😔', confused: '😕',
    disappointed: '😞', worried: '😟', cry: '😢', sob: '😭',
    angry: '😠', rage: '🤬', scream: '😱', flushed: '😳',
    dizzy_face: '😵', mask: '😷', sunglasses: '😎', sleeping: '😴',
    stuck_out_tongue: '😛', stuck_out_tongue_winking_eye: '😜',
    nerd: '🤓', cowboy: '🤠', smirk: '😏', relieved: '😌',
    yum: '😋', drooling: '🤤', hugs: '🤗', shush: '🤫',
    zipper_mouth: '🤐', rolling_eyes: '🙄', grimacing: '😬',
    pleading: '🥺', partying: '🥳', exploding_head: '🤯',

    // Hands & Gestures
    thumbsup: '👍', '+1': '👍', thumbsdown: '👎', '-1': '👎',
    wave: '👋', clap: '👏', pray: '🙏', handshake: '🤝',
    muscle: '💪', point_up: '☝️', point_down: '👇',
    point_left: '👈', point_right: '👉', ok_hand: '👌',
    raised_hand: '✋', fist: '✊', v: '✌️', crossed_fingers: '🤞',
    call_me: '🤙', metal: '🤘', writing_hand: '✍️',
    nail_care: '💅', palms_up: '🤲', open_hands: '👐',

    // Objects & Symbols
    rocket: '🚀', fire: '🔥', star: '⭐', star2: '🌟',
    sparkles: '✨', bulb: '💡', warning: '⚠️', check: '✅',
    white_check_mark: '✅', x: '❌', exclamation: '❗',
    question: '❓', bang: '‼️', hundred: '💯',
    trophy: '🏆', medal: '🏅', crown: '👑', gem: '💎',
    money: '💰', dollar: '💵', credit_card: '💳',
    gift: '🎁', balloon: '🎈', tada: '🎉', confetti: '🎊',
    bell: '🔔', megaphone: '📢', loudspeaker: '📢',
    key: '🔑', lock: '🔒', unlock: '🔓',
    book: '📖', bookmark: '🔖', memo: '📝', pencil: '✏️',
    clipboard: '📋', calendar: '📅', hourglass: '⏳',
    watch: '⌚', alarm_clock: '⏰', stopwatch: '⏱️',
    mag: '🔍', microscope: '🔬', telescope: '🔭',
    pill: '💊', syringe: '💉', dna: '🧬',

    // Nature & Weather
    sun: '☀️', sunny: '☀️', moon: '🌙', crescent_moon: '🌙',
    cloud: '☁️', rain: '🌧️', snow: '❄️', snowflake: '❄️',
    thunder: '⛈️', lightning: '⚡', zap: '⚡', rainbow: '🌈',
    umbrella: '☂️', wind: '💨', tornado: '🌪️', fog: '🌫️',
    tree: '🌳', evergreen_tree: '🌲', palm_tree: '🌴',
    flower: '🌸', rose: '🌹', sunflower: '🌻', tulip: '🌷',
    seedling: '🌱', herb: '🌿', leaves: '🍃', fallen_leaf: '🍂',
    mushroom: '🍄', cactus: '🌵', earth: '🌍', globe: '🌎',
    ocean: '🌊', wave_water: '🌊', volcano: '🌋',

    // Animals
    dog: '🐕', cat: '🐈', mouse_face: '🐭', rabbit: '🐇',
    bear: '🐻', panda: '🐼', koala: '🐨', tiger: '🐯',
    lion: '🦁', cow: '🐄', pig: '🐷', frog: '🐸',
    monkey: '🐒', chicken: '🐔', penguin: '🐧', bird: '🐦',
    eagle: '🦅', owl: '🦉', bat: '🦇', wolf: '🐺',
    fox: '🦊', unicorn: '🦄', bee: '🐝', bug_insect: '🐛',
    butterfly: '🦋', snail: '🐌', snake: '🐍', octopus: '🐙',
    dolphin: '🐬', whale: '🐋', shark: '🦈', fish: '🐟',
    turtle: '🐢', crocodile: '🐊', dragon: '🐉',

    // Food & Drink
    pizza: '🍕', hamburger: '🍔', fries: '🍟', hotdog: '🌭',
    taco: '🌮', burrito: '🌯', sushi: '🍣', ramen: '🍜',
    spaghetti: '🍝', bread: '🍞', cheese: '🧀', egg: '🥚',
    apple: '🍎', banana: '🍌', watermelon: '🍉', grapes: '🍇',
    strawberry: '🍓', peach: '🍑', cherry: '🍒', lemon: '🍋',
    avocado: '🥑', broccoli: '🥦', carrot: '🥕', corn: '🌽',
    coffee: '☕', tea: '🍵', beer: '🍺', wine: '🍷',
    cocktail: '🍸', ice_cream: '🍦', cake: '🎂', cookie: '🍪',
    chocolate: '🍫', candy: '🍬', popcorn: '🍿',

    // Hearts & Symbols
    heart: '❤️', red_heart: '❤️', orange_heart: '🧡',
    yellow_heart: '💛', green_heart: '💚', blue_heart: '💙',
    purple_heart: '💜', black_heart: '🖤', white_heart: '🤍',
    broken_heart: '💔', heartbeat: '💓', sparkling_heart: '💖',
    arrow_right: '➡️', arrow_left: '⬅️', arrow_up: '⬆️',
    arrow_down: '⬇️', arrow_upper_right: '↗️', arrow_lower_right: '↘️',
    arrows_counterclockwise: '🔄', infinity: '♾️',
    peace: '☮️', yin_yang: '☯️', atom: '⚛️', recycle: '♻️',

    // Tech & Tools
    computer: '💻', laptop: '💻', keyboard: '⌨️',
    mouse_comp: '🖱️', phone: '📱', telephone: '📞',
    email: '📧', envelope: '✉️', inbox: '📥', outbox: '📤',
    link: '🔗', paperclip: '📎', gear: '⚙️', wrench: '🔧',
    hammer: '🔨', nut_and_bolt: '🔩', shield: '🛡️',
    bug: '🐛', robot: '🤖', satellite: '🛰️', battery: '🔋',
    electric_plug: '🔌', floppy_disk: '💾', cd: '💿',
    camera: '📷', video_camera: '📹', tv: '📺', radio: '📻',
    printer: '🖨️', desktop: '🖥️', joystick: '🕹️',

    // Transport & Places
    car: '🚗', taxi: '🚕', bus: '🚌', ambulance: '🚑',
    truck: '🚚', bike: '🚲', airplane: '✈️', helicopter: '🚁',
    ship: '🚢', train: '🚆', metro: '🚇',
    house: '🏠', office: '🏢', hospital: '🏥', school: '🏫',
    factory: '🏭', tent: '⛺', stadium: '🏟️',

    // Flags & Misc
    flag_white: '🏳️', flag_black: '🏴', checkered_flag: '🏁',
    triangular_flag: '🚩', construction: '🚧', anchor: '⚓',
    skull: '💀', ghost: '👻', alien: '👽', poop: '💩',
    eyes: '👀', eye: '👁️', brain: '🧠', tongue: '👅',
    lips: '👄', baby: '👶', superhero: '🦸',
};

/**
 * Replace :shortcode: emoji patterns with unicode emoji.
 * Skips content inside code blocks and inline code.
 * @param {string} text - Raw markdown text (before parsing)
 * @returns {string} Text with emoji shortcodes replaced
 */
export function processEmoji(text) {
    if (!text) return text;

    // Split on code fences and inline code to protect them
    // Pattern matches: ```...```, `...`, or non-code segments
    const segments = text.split(/(```[\s\S]*?```|`[^`\n]+`)/g);

    return segments.map((segment, index) => {
        // Odd indices are code blocks/inline code — leave untouched
        if (index % 2 === 1) return segment;

        // Replace :shortcode: patterns in non-code text
        return segment.replace(/:([a-zA-Z0-9_+-]+):/g, (match, code) => {
            const emoji = EMOJI_MAP[code];
            return emoji !== undefined ? emoji : match;
        });
    }).join('');
}
