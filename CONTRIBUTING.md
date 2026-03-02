# Contributing to Nexus MCP

Thank you for your interest in contributing! 🎉

## How to Contribute

### Reporting Bugs
- Use GitHub Issues
- Include steps to reproduce
- Provide environment details (Node version, OS, etc.)

### Feature Requests
- Open an issue describing the feature
- Explain the use case
- Discuss implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Build and test: `npm run build`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- TypeScript strict mode
- Clear variable/function names
- Add comments for complex logic
- Keep functions small and focused

### Adding New Tools

Edit `src/tools.ts`:

```typescript
const newTool: ToolConfig = {
  name: 'tool_name',
  description: 'What it does',
  price: '0.10', // USDC
  inputSchema: { /* schema */ },
  handler: async (args) => { /* implementation */ }
};
```

### Testing
- Test with MCP Inspector: `npm run inspector`
- Verify payment flow works
- Check error handling

## Questions?

Open an issue or reach out to borishalachev636@gmail.com

---

**Code of Conduct**: Be respectful and constructive.
