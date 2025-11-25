import * as fs from 'fs';
import * as path from 'path';
import { DesignFilter } from './DesignFilterEngine';
import { ComponentStyleInfo } from './ComponentStyleRefactor';

export interface Screenshot {
  componentPath: string;
  componentName: string;
  imagePath: string;
  timestamp: Date;
  metadata: {
    width: number;
    height: number;
    viewport: string;
  };
}

export interface ComponentPreview {
  componentPath: string;
  componentName: string;
  before: Screenshot;
  after: Screenshot;
  changes: string[];
}

export interface PreviewComparison {
  filterName: string;
  componentsAffected: number;
  previews: ComponentPreview[];
  timestamp: Date;
  approved: boolean;
}

export interface PreviewOptions {
  maxComponents?: number;
  viewports?: Array<{ name: string; width: number; height: number }>;
  outputDir?: string;
  includeMetadata?: boolean;
}

/**
 * PreviewGenerator captures before/after screenshots of components
 * when design filters are applied
 */
export class PreviewGenerator {
  private projectRoot: string;
  private previewDir: string;
  private defaultViewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
  ];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.previewDir = path.join(projectRoot, '.azstudio', 'previews');
    this.ensurePreviewDirectory();
  }

  /**
   * Ensure preview directory exists
   */
  private ensurePreviewDirectory(): void {
    if (!fs.existsSync(this.previewDir)) {
      fs.mkdirSync(this.previewDir, { recursive: true });
    }
  }

  /**
   * Generate before/after preview for design filter application
   */
  async generateFilterPreview(
    filter: DesignFilter,
    components: ComponentStyleInfo[],
    options: PreviewOptions = {}
  ): Promise<PreviewComparison> {
    const {
      maxComponents = 10,
      viewports = this.defaultViewports,
      outputDir = this.previewDir,
      includeMetadata = true,
    } = options;

    console.log(`Generating preview for filter: ${filter.name}`);
    console.log(`Components to preview: ${Math.min(components.length, maxComponents)}`);

    // Create filter-specific directory
    const filterDir = path.join(outputDir, this.sanitizeFileName(filter.name));
    if (!fs.existsSync(filterDir)) {
      fs.mkdirSync(filterDir, { recursive: true });
    }

    const previews: ComponentPreview[] = [];
    const componentsToPreview = components.slice(0, maxComponents);

    for (const component of componentsToPreview) {
      try {
        const preview = await this.generateComponentPreview(
          component,
          filter,
          filterDir,
          viewports
        );
        previews.push(preview);
      } catch (error) {
        console.warn(`Failed to generate preview for ${component.componentName}:`, error);
      }
    }

    const comparison: PreviewComparison = {
      filterName: filter.name,
      componentsAffected: components.length,
      previews,
      timestamp: new Date(),
      approved: false,
    };

    // Save comparison metadata
    if (includeMetadata) {
      await this.saveComparisonMetadata(comparison, filterDir);
    }

    // Generate HTML comparison view
    await this.generateComparisonHTML(comparison, filterDir);

    console.log(`Preview generated at: ${filterDir}`);
    return comparison;
  }

  /**
   * Generate preview for a single component
   */
  private async generateComponentPreview(
    component: ComponentStyleInfo,
    filter: DesignFilter,
    outputDir: string,
    viewports: Array<{ name: string; width: number; height: number }>
  ): Promise<ComponentPreview> {
    const componentDir = path.join(
      outputDir,
      this.sanitizeFileName(component.componentName)
    );
    
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }

    // Capture before screenshot
    const beforeScreenshot = await this.captureComponentScreenshot(
      component,
      'before',
      componentDir,
      viewports[0] // Use desktop viewport by default
    );

    // Simulate after state (in real implementation, this would apply the filter temporarily)
    const afterScreenshot = await this.captureComponentScreenshot(
      component,
      'after',
      componentDir,
      viewports[0]
    );

    // Extract changes from component
    const changes = this.extractChanges(component, filter);

    return {
      componentPath: component.filePath,
      componentName: component.componentName,
      before: beforeScreenshot,
      after: afterScreenshot,
      changes,
    };
  }

  /**
   * Capture screenshot of a component
   * Note: This is a placeholder implementation. In production, this would:
   * 1. Start a dev server or use existing one
   * 2. Use Playwright/Puppeteer to render the component
   * 3. Capture actual screenshots
   */
  private async captureComponentScreenshot(
    component: ComponentStyleInfo,
    stage: 'before' | 'after',
    outputDir: string,
    viewport: { name: string; width: number; height: number }
  ): Promise<Screenshot> {
    const timestamp = new Date();
    const fileName = `${stage}-${viewport.name}-${timestamp.getTime()}.png`;
    const imagePath = path.join(outputDir, fileName);

    // Placeholder: Create a metadata file instead of actual screenshot
    // In production, this would use Playwright to capture real screenshots
    const placeholderData = {
      component: component.componentName,
      stage,
      viewport: viewport.name,
      timestamp: timestamp.toISOString(),
      note: 'Placeholder - actual screenshot would be captured here',
    };

    // Write placeholder metadata
    const metadataPath = imagePath.replace('.png', '.json');
    await fs.promises.writeFile(
      metadataPath,
      JSON.stringify(placeholderData, null, 2),
      'utf-8'
    );

    // Create a simple placeholder image file (empty file for now)
    await fs.promises.writeFile(imagePath, '', 'utf-8');

    return {
      componentPath: component.filePath,
      componentName: component.componentName,
      imagePath,
      timestamp,
      metadata: {
        width: viewport.width,
        height: viewport.height,
        viewport: viewport.name,
      },
    };
  }

  /**
   * Extract changes that will be applied to component
   */
  private extractChanges(
    component: ComponentStyleInfo,
    filter: DesignFilter
  ): string[] {
    const changes: string[] = [];

    // Check class transformations
    for (const className of component.classNames) {
      for (const [oldClass, newClass] of Object.entries(filter.classTransforms)) {
        if (className.includes(oldClass)) {
          changes.push(`Class: ${oldClass} → ${newClass}`);
        }
      }
    }

    // Check token updates
    if (filter.tokens.colors) {
      changes.push('Colors: Updated to new palette');
    }

    if (filter.tokens.borderRadius) {
      changes.push('Border Radius: Updated to new scale');
    }

    if (filter.tokens.shadows) {
      changes.push('Shadows: Updated to new elevation');
    }

    // Check inline styles
    if (component.hasInlineStyles) {
      changes.push(`Inline Styles: ${component.inlineStyles.length} styles to convert`);
    }

    // Check CSS modules
    if (component.hasCSSModule) {
      changes.push('CSS Module: Will be updated with new tokens');
    }

    return changes;
  }

  /**
   * Save comparison metadata to JSON file
   */
  private async saveComparisonMetadata(
    comparison: PreviewComparison,
    outputDir: string
  ): Promise<void> {
    const metadataPath = path.join(outputDir, 'comparison-metadata.json');
    const metadata = {
      filterName: comparison.filterName,
      componentsAffected: comparison.componentsAffected,
      previewsGenerated: comparison.previews.length,
      timestamp: comparison.timestamp.toISOString(),
      approved: comparison.approved,
      previews: comparison.previews.map(p => ({
        componentName: p.componentName,
        componentPath: p.componentPath,
        changes: p.changes,
        beforeImage: path.relative(outputDir, p.before.imagePath),
        afterImage: path.relative(outputDir, p.after.imagePath),
      })),
    };

    await fs.promises.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );
  }

  /**
   * Generate HTML comparison view
   */
  private async generateComparisonHTML(
    comparison: PreviewComparison,
    outputDir: string
  ): Promise<void> {
    const htmlPath = path.join(outputDir, 'comparison.html');
    const html = this.buildComparisonHTML(comparison, outputDir);
    await fs.promises.writeFile(htmlPath, html, 'utf-8');
  }

  /**
   * Build HTML for comparison view
   */
  private buildComparisonHTML(
    comparison: PreviewComparison,
    baseDir: string
  ): string {
    const previewsHTML = comparison.previews
      .map(preview => {
        const beforePath = path.relative(baseDir, preview.before.imagePath);
        const afterPath = path.relative(baseDir, preview.after.imagePath);
        const changesHTML = preview.changes
          .map(change => `<li>${this.escapeHtml(change)}</li>`)
          .join('');

        return `
          <div class="component-preview">
            <h3>${this.escapeHtml(preview.componentName)}</h3>
            <p class="component-path">${this.escapeHtml(preview.componentPath)}</p>
            
            <div class="comparison-container">
              <div class="screenshot-container">
                <h4>Before</h4>
                <div class="screenshot-placeholder">
                  <p>Screenshot: ${beforePath}</p>
                  <p class="note">Actual screenshot would be displayed here</p>
                </div>
              </div>
              
              <div class="screenshot-container">
                <h4>After</h4>
                <div class="screenshot-placeholder">
                  <p>Screenshot: ${afterPath}</p>
                  <p class="note">Actual screenshot would be displayed here</p>
                </div>
              </div>
            </div>
            
            <div class="changes">
              <h4>Changes Applied</h4>
              <ul>${changesHTML}</ul>
            </div>
          </div>
        `;
      })
      .join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Filter Preview: ${this.escapeHtml(comparison.filterName)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
      color: #333;
    }
    
    .header {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }
    
    .header .meta {
      color: #666;
      font-size: 0.9rem;
    }
    
    .actions {
      margin-top: 1rem;
      display: flex;
      gap: 1rem;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .btn-approve {
      background: #22c55e;
      color: white;
    }
    
    .btn-approve:hover {
      background: #16a34a;
    }
    
    .btn-reject {
      background: #ef4444;
      color: white;
    }
    
    .btn-reject:hover {
      background: #dc2626;
    }
    
    .component-preview {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .component-preview h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }
    
    .component-path {
      color: #666;
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
      font-family: monospace;
    }
    
    .comparison-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }
    
    .screenshot-container h4 {
      font-size: 1rem;
      margin-bottom: 0.75rem;
      color: #555;
    }
    
    .screenshot-placeholder {
      background: #f9f9f9;
      border: 2px dashed #ddd;
      border-radius: 6px;
      padding: 3rem 2rem;
      text-align: center;
      color: #999;
    }
    
    .screenshot-placeholder .note {
      margin-top: 0.5rem;
      font-size: 0.85rem;
      font-style: italic;
    }
    
    .changes {
      border-top: 1px solid #eee;
      padding-top: 1.5rem;
    }
    
    .changes h4 {
      font-size: 1rem;
      margin-bottom: 0.75rem;
      color: #555;
    }
    
    .changes ul {
      list-style: none;
      padding-left: 0;
    }
    
    .changes li {
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
    }
    
    .changes li:before {
      content: '→';
      position: absolute;
      left: 0;
      color: #3b82f6;
      font-weight: bold;
    }
    
    @media (max-width: 768px) {
      .comparison-container {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Design Filter Preview: ${this.escapeHtml(comparison.filterName)}</h1>
    <div class="meta">
      <p>Generated: ${comparison.timestamp.toLocaleString()}</p>
      <p>Components Affected: ${comparison.componentsAffected}</p>
      <p>Previews Generated: ${comparison.previews.length}</p>
    </div>
    <div class="actions">
      <button class="btn btn-approve" onclick="approveChanges()">
        ✓ Approve Changes
      </button>
      <button class="btn btn-reject" onclick="rejectChanges()">
        ✗ Reject Changes
      </button>
    </div>
  </div>
  
  ${previewsHTML}
  
  <script>
    function approveChanges() {
      if (confirm('Approve and apply all design filter changes?')) {
        alert('Changes approved! The design filter will be applied.');
        // In production, this would trigger IPC to apply changes
      }
    }
    
    function rejectChanges() {
      if (confirm('Reject all design filter changes?')) {
        alert('Changes rejected. No modifications will be made.');
        // In production, this would trigger IPC to cancel
      }
    }
  </script>
</body>
</html>
    `.trim();
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Sanitize file name
   */
  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Load existing comparison
   */
  async loadComparison(filterName: string): Promise<PreviewComparison | null> {
    const filterDir = path.join(this.previewDir, this.sanitizeFileName(filterName));
    const metadataPath = path.join(filterDir, 'comparison-metadata.json');

    if (!fs.existsSync(metadataPath)) {
      return null;
    }

    try {
      const content = await fs.promises.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(content);
      
      return {
        filterName: metadata.filterName,
        componentsAffected: metadata.componentsAffected,
        previews: [], // Would need to reconstruct from metadata
        timestamp: new Date(metadata.timestamp),
        approved: metadata.approved,
      };
    } catch (error) {
      console.error('Failed to load comparison:', error);
      return null;
    }
  }

  /**
   * Approve comparison and mark for application
   */
  async approveComparison(filterName: string): Promise<boolean> {
    const comparison = await this.loadComparison(filterName);
    if (!comparison) {
      return false;
    }

    comparison.approved = true;
    
    const filterDir = path.join(this.previewDir, this.sanitizeFileName(filterName));
    await this.saveComparisonMetadata(comparison, filterDir);
    
    return true;
  }

  /**
   * Reject comparison and clean up
   */
  async rejectComparison(filterName: string): Promise<boolean> {
    const filterDir = path.join(this.previewDir, this.sanitizeFileName(filterName));
    
    if (!fs.existsSync(filterDir)) {
      return false;
    }

    // Mark as rejected in metadata
    const comparison = await this.loadComparison(filterName);
    if (comparison) {
      comparison.approved = false;
      await this.saveComparisonMetadata(comparison, filterDir);
    }

    return true;
  }

  /**
   * Clean up old previews
   */
  async cleanupOldPreviews(daysOld: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let cleaned = 0;
    const entries = await fs.promises.readdir(this.previewDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dirPath = path.join(this.previewDir, entry.name);
        const metadataPath = path.join(dirPath, 'comparison-metadata.json');

        if (fs.existsSync(metadataPath)) {
          try {
            const content = await fs.promises.readFile(metadataPath, 'utf-8');
            const metadata = JSON.parse(content);
            const timestamp = new Date(metadata.timestamp);

            if (timestamp < cutoffDate) {
              await fs.promises.rm(dirPath, { recursive: true, force: true });
              cleaned++;
            }
          } catch (error) {
            console.warn(`Failed to process ${dirPath}:`, error);
          }
        }
      }
    }

    return cleaned;
  }

  /**
   * Get all available previews
   */
  async listPreviews(): Promise<Array<{ filterName: string; timestamp: Date; approved: boolean }>> {
    const previews: Array<{ filterName: string; timestamp: Date; approved: boolean }> = [];
    
    if (!fs.existsSync(this.previewDir)) {
      return previews;
    }

    const entries = await fs.promises.readdir(this.previewDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const comparison = await this.loadComparison(entry.name);
        if (comparison) {
          previews.push({
            filterName: comparison.filterName,
            timestamp: comparison.timestamp,
            approved: comparison.approved,
          });
        }
      }
    }

    return previews.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}
