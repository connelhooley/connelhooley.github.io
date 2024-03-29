import "./src/styles/global.css";
import "./src/styles/prism.css";

// https://stackoverflow.com/a/59429852/310098
// https://github.com/FortAwesome/react-fontawesome/issues/134
// The following import prevents a Font Awesome icon server-side rendering bug,
// where the icons flash from a very large icon down to a properly sized one:
import "@fortawesome/fontawesome-svg-core/styles.css";
// Prevent fontawesome from adding its CSS since we did it manually above:
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
