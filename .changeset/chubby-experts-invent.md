---
"@browserbasehq/stagehand-examples": minor
"@browserbasehq/stagehand-lib": minor
"@browserbasehq/stagehand": minor
---

add upload method with file input + url/buffer support

## New Features

### 🚀 File Upload Method
- **`stagehand.upload(hint: string, file: FileSpec)`** - New method for AI-powered file uploads
- **Natural language hints** - Use descriptive text to locate file inputs (e.g., "Upload resume", "Upload cover letter")
- **Multiple file sources** - Support for URLs, local paths, and in-memory buffers
- **AI-powered detection** - Leverages Stagehand's `observe()` method for intelligent element finding

### 🔧 Enhanced Type System
- **`FileSpec`** - Discriminated union type for flexible file specification
- **`UploadResult`** - Structured response with upload status and metadata
- **Type safety** - Proper validation of file input combinations

### 🌐 Environment Support
- **LOCAL environment** - Works with local Playwright browsers
- **BROWSERBASE environment** - Compatible with cloud-managed browser sessions
- **Cross-platform** - Consistent behavior across different environments

## Technical Details

### Upload Strategies
1. **Direct input** - Attach files directly to `<input type="file">` elements
2. **File chooser** - Trigger file choosers by clicking associated controls
3. **Heuristic search** - Find file inputs near/within hinted elements

### File Processing
- **URL downloads** - Automatic fetching and MIME type detection
- **Memory efficient** - No temporary file creation
- **Buffer handling** - Direct support for in-memory file data

### Integration
- **History tracking** - Upload events logged to Stagehand history
- **Error handling** - Graceful fallbacks with detailed error reporting
- **Performance** - Optimized for minimal DOM queries and efficient file processing

## Usage Examples

```typescript
// Upload from URL
await stagehand.upload("Upload resume", "https://example.com/resume.pdf");

// Upload from buffer
await stagehand.upload("Upload document", {
  name: "document.pdf",
  mimeType: "application/pdf",
  buffer: pdfBuffer
});

// Multiple uploads
await stagehand.upload("Upload resume", resumeFileUrl);
await stagehand.upload("Upload cover letter", letterFileUrl);
```

## Breaking Changes
None - This is a purely additive feature that maintains backward compatibility.

## Migration
No migration required - existing code continues to work unchanged.
