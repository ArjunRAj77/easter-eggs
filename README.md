# Easter Eggs 🥚

A curated gallery of copy-pasteable easter eggs for developers. Add a touch of delight (or chaos) to your applications.

## Features

- **Curated Gallery**: Browse a collection of easter eggs for Web, Mobile, CLI, and more.
- **Instant Filtering**: Filter by category, difficulty, or search by keyword.
- **Code Snippets**: Copy-paste ready code for various languages and frameworks (React, JavaScript, Python, etc.).
- **Interactive Previews**: See what the easter egg does before implementing it.
- **Dark Mode**: A developer-friendly dark theme.

## Tech Stack

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data**: JSON-driven content

## Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/easter-egg.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Contributing

We welcome contributions! If you have a cool easter egg to share, please follow these steps:

### How to Add an Easter Egg

All easter egg data is stored in `src/data/eggs.json`. To add a new egg:

1.  **Fork the repository** and create a new branch for your feature.
2.  Open `src/data/eggs.json`.
3.  Add a new object to the array following this structure:

    ```json
    {
      "id": "unique-id-slug",
      "title": "Easter Egg Title",
      "description": "A short description of what it does.",
      "category": "Web", // Options: "Web", "Mobile", "Game", "CLI", "Desktop"
      "difficulty": "Easy", // Options: "Easy", "Medium", "Chaotic"
      "tags": ["tag1", "tag2"],
      "previewType": "icon",
      "iconName": "Smile", // Pick a suitable icon from Lucide React
      "snippets": [
        {
          "label": "Language/Framework",
          "language": "javascript", // or typescript, python, etc.
          "code": "Your code here..."
        }
      ]
    }
    ```

4.  **Verify your JSON**: Ensure the JSON is valid and the code snippets are properly escaped (especially newlines `\n` and quotes `\"`).
5.  **Test it**: Run the app locally to make sure your card appears and looks good.
6.  **Submit a Pull Request**: Open a PR with a description of your easter egg.

### Guidelines

-   **Keep it safe**: No malicious code. Easter eggs should be fun, not harmful.
-   **Keep it simple**: The code should be easy to copy and integrate.
-   **Categorize correctly**: Choose the most appropriate category and difficulty.

## License

MIT
