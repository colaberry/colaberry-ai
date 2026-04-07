const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, LevelFormat, PageNumber, PageBreak } = require("docx");

const CORAL = "DC2626";
const ZINC900 = "18181B";
const ZINC50 = "FAFAFA";
const ZINC200 = "E4E4E7";
const ZINC400 = "A1A1AA";
const ZINC600 = "71717A";

const border = { style: BorderStyle.SINGLE, size: 1, color: ZINC200 };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: ZINC900, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })]
  });
}

function dataCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 20 })] })]
  });
}

function makeTable(headers, rows, widths) {
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ children: headers.map((h, i) => headerCell(h, widths[i])) }),
      ...rows.map(row => new TableRow({
        children: row.map((cell, i) => dataCell(cell, widths[i]))
      }))
    ]
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 32, color: CORAL })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 26, color: ZINC900 })]
  });
}

function para(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}

function boldPara(label, text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: label, bold: true, font: "Arial", size: 22 }),
      new TextRun({ text, font: "Arial", size: 22 })
    ]
  });
}

function bullet(text, ref) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}

function importantNote(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { left: { style: BorderStyle.SINGLE, size: 6, color: CORAL, space: 8 } },
    indent: { left: 360 },
    children: [
      new TextRun({ text: "IMPORTANT: ", bold: true, font: "Arial", size: 22, color: CORAL }),
      new TextRun({ text, font: "Arial", size: 22 })
    ]
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    shading: { fill: "F4F4F5", type: ShadingType.CLEAR },
    indent: { left: 360 },
    children: [new TextRun({ text, font: "Courier New", size: 20 })]
  });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: CORAL }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial" }, paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: CORAL, space: 4 } },
          children: [
            new TextRun({ text: "Colaberry AI", bold: true, font: "Arial", size: 18, color: CORAL }),
            new TextRun({ text: "  |  Cloudflare DNS Cutover Guide", font: "Arial", size: 18, color: ZINC400 })
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: ZINC200, space: 4 } },
          children: [
            new TextRun({ text: "Confidential  |  Page ", font: "Arial", size: 16, color: ZINC400 }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: ZINC400 })
          ]
        })]
      })
    },
    children: [
      // Title page
      new Paragraph({ spacing: { before: 3600 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "Cloudflare DNS Cutover", bold: true, font: "Arial", size: 56, color: CORAL })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: "colaberry.ai", bold: true, font: "Arial", size: 40, color: ZINC900 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "Step-by-step guide for pointing colaberry.ai to GCP Cloud Run production", font: "Arial", size: 24, color: ZINC600 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: CORAL, space: 8 } },
        spacing: { before: 200 },
        children: [new TextRun({ text: "March 27, 2026", font: "Arial", size: 22, color: ZINC400 })]
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // Section 1: Prerequisites
      heading1("1. Prerequisites"),
      bullet("Cloudflare account access with DNS management for colaberry.ai zone", "bullets"),
      bullet("GCP Cloud Run domain mappings configured for: colaberry-ai-prod, colaberry-ai-cms-prod", "bullets"),
      bullet("DNS records must be set to \"DNS only\" (grey cloud icon) for GCP SSL certificate provisioning", "bullets"),
      importantNote("Cloudflare proxy (orange cloud) must be OFF for all records pointing to GCP. GCP requires DNS-only mode to provision and renew SSL certificates via Let's Encrypt."),

      // Section 2: Apex Domain
      heading1("2. Configure Apex Domain (colaberry.ai)"),
      para("Navigate to Cloudflare Dashboard \u2192 colaberry.ai \u2192 DNS \u2192 Records"),
      para("Add or update 4 A records for the apex domain (@):"),
      new Paragraph({ spacing: { after: 80 } }),
      makeTable(
        ["Type", "Name", "Content", "Proxy Status"],
        [
          ["A", "@", "216.239.32.21", "DNS only"],
          ["A", "@", "216.239.34.21", "DNS only"],
          ["A", "@", "216.239.36.21", "DNS only"],
          ["A", "@", "216.239.38.21", "DNS only"],
        ],
        [1200, 1800, 3600, 2760]
      ),
      new Paragraph({ spacing: { after: 120 } }),
      para("These are Google Cloud Run's anycast IPs for custom domain mapping. All 4 IPs are required for high availability and geographic load balancing."),
      importantNote("Proxy must be OFF (DNS only / grey cloud) for GCP to provision SSL certificates. If proxy is on, GCP SSL provisioning will fail silently."),

      // Section 3: CMS Subdomain
      heading1("3. Configure CMS Subdomain (cms.colaberry.ai)"),
      para("Add a new CNAME record for the CMS subdomain:"),
      new Paragraph({ spacing: { after: 80 } }),
      makeTable(
        ["Type", "Name", "Content", "Proxy Status"],
        [["CNAME", "cms", "ghs.googlehosted.com", "DNS only"]],
        [1200, 1800, 3600, 2760]
      ),
      new Paragraph({ spacing: { after: 120 } }),
      para("This points to the Strapi v5 headless CMS running on the colaberry-ai-cms-prod Cloud Run service."),

      // Section 4: WWW Subdomain
      heading1("4. Update WWW Subdomain (www.colaberry.ai)"),
      para("Edit the existing www CNAME record to point to GCP:"),
      new Paragraph({ spacing: { after: 80 } }),
      makeTable(
        ["Type", "Name", "Old Content", "New Content", "Proxy Status"],
        [["CNAME", "www", "sites.ludicrous.cloud", "ghs.googlehosted.com", "DNS only"]],
        [1100, 1200, 2400, 2600, 2060]
      ),
      new Paragraph({ spacing: { after: 120 } }),
      para("This redirects www traffic through GCP Cloud Run, ensuring www.colaberry.ai serves the same site as colaberry.ai."),

      // Section 5: Verify GCP Domain Mappings
      heading1("5. Verify GCP Domain Mappings"),
      para("After DNS records are saved, verify the GCP side is ready:"),
      bullet("Go to GCP Console \u2192 Cloud Run \u2192 Domain Mappings", "bullets"),
      bullet("Confirm these mappings exist:", "bullets"),
      new Paragraph({ spacing: { after: 80 } }),
      makeTable(
        ["Domain", "Cloud Run Service"],
        [
          ["colaberry.ai", "colaberry-ai-prod"],
          ["www.colaberry.ai", "colaberry-ai-prod"],
          ["cms.colaberry.ai", "colaberry-ai-cms-prod"],
        ],
        [4680, 4680]
      ),
      new Paragraph({ spacing: { after: 120 } }),
      para("SSL certificates will auto-provision after DNS propagation (typically 5\u201315 minutes). GCP uses Let's Encrypt for managed certificates."),

      // Section 6: Post-Cutover Verification
      heading1("6. Post-Cutover Verification"),
      para("Run these commands to verify the cutover was successful:"),
      new Paragraph({ spacing: { after: 80 } }),
      boldPara("Check DNS propagation:", ""),
      codeBlock("dig colaberry.ai  # Should return 216.239.x.x IPs"),
      new Paragraph({ spacing: { after: 80 } }),
      boldPara("Verify HTTPS (main site):", ""),
      codeBlock("curl -I https://colaberry.ai  # Should return 200"),
      new Paragraph({ spacing: { after: 80 } }),
      boldPara("Verify CMS:", ""),
      codeBlock("curl -I https://cms.colaberry.ai/admin  # Should return 200"),
      new Paragraph({ spacing: { after: 80 } }),
      boldPara("Verify old URL redirect:", ""),
      codeBlock("curl -I https://colaberry.ai/episodes  # Should return 301 \u2192 /resources/podcasts"),
      new Paragraph({ spacing: { after: 80 } }),
      boldPara("Verify www:", ""),
      codeBlock("curl -I https://www.colaberry.ai  # Should redirect or serve site"),

      // Section 7: Reference
      heading1("7. Existing DNS Records (Reference)"),
      para("These records were already configured and should not be modified:"),
      new Paragraph({ spacing: { after: 80 } }),
      makeTable(
        ["Subdomain", "Type", "Content", "Purpose"],
        [
          ["dev.colaberry.ai", "CNAME", "ghs.googlehosted.com", "Staging frontend"],
          ["dev-cms.colaberry.ai", "CNAME", "ghs.googlehosted.com", "Staging CMS"],
        ],
        [2400, 1200, 3000, 2760]
      ),

      // Section 8: Rollback
      heading1("8. Rollback Plan"),
      para("If issues arise after the DNS cutover, revert the changes:"),
      bullet("Revert the 4 A records to the previous hosting provider IPs", "bullets"),
      bullet("Revert www CNAME back to sites.ludicrous.cloud", "bullets"),
      bullet("Remove the cms CNAME record", "bullets"),
      bullet("DNS changes propagate within 5 minutes with Cloudflare (low TTL)", "bullets"),
      new Paragraph({ spacing: { after: 120 } }),
      importantNote("Keep a record of the old DNS values before making changes. Cloudflare audit log also tracks all modifications."),
    ]
  }]
});

const outPath = "/Users/colaberry016gmail.com/Desktop/Projects/colaberry-ai-fork/docs/Cloudflare-DNS-Cutover-Steps.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log("Created:", outPath);
});
