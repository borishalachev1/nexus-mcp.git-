# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please do the following:

### Do NOT:
- Open a public GitHub issue
- Disclose the vulnerability publicly

### Do:
1. Email **borishalachev636@gmail.com** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

2. Use subject line: `[SECURITY] Nexus MCP Vulnerability Report`

3. You will receive a response within **48 hours**

4. We will work with you to:
   - Verify the issue
   - Develop a fix
   - Coordinate disclosure timeline

## Security Best Practices

### For Users:
- ✅ Never commit `.env` files with real credentials
- ✅ Use environment variables for secrets
- ✅ Regularly rotate API keys and secrets
- ✅ Use testnet for development
- ✅ Audit payment recipients before mainnet deployment
- ✅ Keep dependencies updated

### For Developers:
- ✅ All payment signatures are verified via X402 protocol
- ✅ No private keys are stored in the server
- ✅ Payment deadlines prevent replay attacks
- ✅ Witness pattern locks payment destinations
- ✅ HTTPS for all facilitator communications

## Known Security Considerations

1. **Testnet Only**: Current version is for testnet use only
2. **No Private Keys**: Server never handles private keys
3. **Signature Verification**: All payments verified cryptographically
4. **Deadline Enforcement**: Signatures expire to prevent replays
5. **No State Storage**: Server is stateless for security

## Audit Status

- [ ] External security audit (planned)
- [ ] Mainnet readiness review (planned)
- [x] Testnet deployment verified
- [x] Payment flow tested

## Dependencies

We regularly update dependencies to patch security vulnerabilities. Run:

```bash
npm audit
npm audit fix
```

---

**Thank you for helping keep Nexus MCP secure!**
