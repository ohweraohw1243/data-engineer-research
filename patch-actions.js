// Update inline styles to use css class and clean up the old mess
const appJsPath = "js/app.js";
const fs = require('fs');
let code = fs.readFileSync(appJsPath, 'utf8');

// Replace injected inline flex on .task-box if any saved it ? No, they are generated on the fly. 
// Just need to fix the button layout.
