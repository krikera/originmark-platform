# OriginMark Flow Diagrams

This folder contains comprehensive Mermaid diagrams showing how each component of the OriginMark system works.

##  Available Diagrams

1. **[API Architecture](01-api-architecture.md)** - Complete FastAPI backend architecture
2. **[Web Dashboard Flow](02-web-dashboard.md)** - Next.js 16 web application flow
3. **[System Overview](03-system-overview.md)** - High-level system architecture

## 🛠 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Web Dashboard | Next.js + Turbopack | 16.x |
| UI Framework | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| Animations | Framer Motion | 11.x |
| Icons | Lucide React | 1.x |
| API | FastAPI + SQLAlchemy | - |
| Database | PostgreSQL / SQLite | 16+ / 3+ |

##  How to Use These Diagrams

### Option 1: Online Viewers
Copy the Mermaid code from any `.md` file and paste it into:
- [Mermaid Live Editor](https://mermaid.live/) - Interactive online editor
- [GitHub](https://github.com) - GitHub automatically renders Mermaid diagrams
- [GitLab](https://gitlab.com) - GitLab also supports Mermaid rendering

### Option 2: Export as Images
Using the Mermaid CLI to convert to images:

```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Convert to PNG
mmdc -i 01-api-architecture.md -o 01-api-architecture.png

# Convert to SVG
mmdc -i 01-api-architecture.md -o 01-api-architecture.svg

# Convert all diagrams
for file in *.md; do
  mmdc -i "$file" -o "${file%.md}.png"
done
```

### Option 3: VS Code Extension
Install the "Mermaid Markdown Syntax Highlighting" extension to view diagrams directly in VS Code.

##  Diagram Details

### 01-api-architecture.md
- Authentication flow with API keys
- Core endpoints for signing and verification
- Database schema and relationships
- Webhook system for notifications

### 02-web-dashboard.md
- **Next.js 16** with Turbopack
- **React 19** hooks architecture
- **Tailwind CSS v4** design tokens
- **Sonner** toast notifications
- **Lucide React** icons
- Minimalist canvas and hairline design

### 03-system-overview.md
- Complete system architecture
- Modern technology stack
- Security boundaries

##  Use Cases

These diagrams are perfect for:
- **Documentation** - Technical documentation and user guides
- **Presentations** - System architecture presentations
- **Onboarding** - New developer orientation
- **Planning** - System design and improvement planning

##  Contributing

1. Edit the Mermaid code in the respective `.md` file
2. Test the diagram in [Mermaid Live Editor](https://mermaid.live/)
3. Update the description section
4. Submit a pull request

For more information about Mermaid syntax, visit the [Mermaid Documentation](https://mermaid-js.github.io/mermaid/).