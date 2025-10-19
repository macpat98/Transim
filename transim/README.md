# transim

This project is a Google Chrome extension that translates selected text on web pages. It captures the user's selection and provides a translation through a popup interface.

## Project Structure

```
transim
├── src
│   ├── background.js        # Background script for managing the extension's lifecycle
│   ├── content.js          # Content script for interacting with web pages
│   └── popup
│       ├── popup.html      # HTML structure of the popup
│       ├── popup.js        # JavaScript for handling popup interactions
│       └── popup.css       # Styles for the popup
├── manifest.json           # Configuration file for the Chrome extension
├── TECHNICAL.md           # Technical documentation
└── README.md              # Project overview and usage instructions
```

## Installation

1. Clone the repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click on "Load unpacked" and select the `transim` directory.

## Usage

1. Select any text on a web page.
2. Click on the extension icon in the Chrome toolbar.
3. The popup will display the translated text.

## Documentation

- For end-users: See the Usage section above.
- For developers: Check [TECHNICAL.md](TECHNICAL.md) for detailed technical documentation.

## Privacy & Permissions

The extension requires minimal permissions to function:

- Storage permission to save your target language preference
- Access to translate.googleapis.com for translation functionality

No tab-specific permissions are needed as the extension works through content scripts.

See [privacy-policy.md](privacy-policy.md) for details on how user data is handled.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.
