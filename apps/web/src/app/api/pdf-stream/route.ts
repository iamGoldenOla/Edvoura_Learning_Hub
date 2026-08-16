import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const relativePdfUrl = searchParams.get('pdfUrl');
    const unlockedWeek = Number(searchParams.get('unlockedWeek') || '1');

    if (!relativePdfUrl) {
      return new NextResponse('Missing pdfUrl parameter', { status: 400 });
    }

    // Resolve local file path inside public directory
    const cleanPath = relativePdfUrl.startsWith('/') ? relativePdfUrl.slice(1) : relativePdfUrl;
    const filePath = path.join(process.cwd(), 'public', cleanPath);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('PDF File Not Found', { status: 404 });
    }

    const originalBuffer = fs.readFileSync(filePath);

    // If All Weeks (36) are unlocked, stream original full PDF directly
    if (unlockedWeek >= 36) {
      return new NextResponse(originalBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    // Load original PDF using pdf-lib
    const pdfDoc = await PDFDocument.load(originalBuffer);
    const totalPages = pdfDoc.getPageCount();

    // Calculate allowed page slice for unlocked week (e.g. Week 1 = 6 pages, Week 2 = 12 pages)
    const allowedPageCount = Math.min(unlockedWeek * 6, totalPages);

    // Create new sliced PDF document
    const slicedDoc = await PDFDocument.create();

    // Copy allowed pages into sliced doc
    const pageIndices = Array.from({ length: allowedPageCount }, (_, i) => i);
    const copiedPages = await slicedDoc.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach((page) => slicedDoc.addPage(page));

    // Append an Impenetrable Pacing Lock Cover Page at the end of the sliced PDF
    const lockPage = slicedDoc.addPage([600, 400]);
    const fontBold = await slicedDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await slicedDoc.embedFont(StandardFonts.Helvetica);

    // Draw Lock Cover Page Content
    lockPage.drawRectangle({
      x: 0,
      y: 0,
      width: 600,
      height: 400,
      color: rgb(0.02, 0.05, 0.11), // Slate 950
    });

    lockPage.drawRectangle({
      x: 40,
      y: 40,
      width: 520,
      height: 320,
      borderColor: rgb(0.98, 0.8, 0.08), // Yellow
      borderWidth: 3,
      color: rgb(0.06, 0.09, 0.16),
    });

    lockPage.drawText(`PACING LOCK SHIELD ACTIVE`, {
      x: 160,
      y: 310,
      size: 16,
      font: fontBold,
      color: rgb(0.98, 0.8, 0.08),
    });

    lockPage.drawText(`WEEK ${unlockedWeek + 1} TO WEEK 36 LOCKED BY TUTOR`, {
      x: 100,
      y: 250,
      size: 18,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    lockPage.drawText(
      `Your tutor has set the live class pacing to Week ${unlockedWeek}.`,
      {
        x: 120,
        y: 200,
        size: 12,
        font: fontRegular,
        color: rgb(0.8, 0.85, 0.9),
      }
    );

    lockPage.drawText(
      `Content for Week ${unlockedWeek + 1} and future terms unlocks automatically as your tutor`,
      {
        x: 80,
        y: 175,
        size: 11,
        font: fontRegular,
        color: rgb(0.7, 0.75, 0.8),
      }
    );

    lockPage.drawText(`advances the live teaching schedule!`, {
      x: 190,
      y: 155,
      size: 11,
      font: fontRegular,
      color: rgb(0.7, 0.75, 0.8),
    });

    lockPage.drawText(
      `Official Edvoura Curriculum Protection Protocol • Doc ID: EDV-PDF-PACING-GUARD`,
      {
        x: 85,
        y: 75,
        size: 9,
        font: fontBold,
        color: rgb(0.5, 0.55, 0.6),
      }
    );

    const pdfBytes = await slicedDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('[PDF STREAM ERROR]', error);
    return new NextResponse('Internal PDF Processing Error', { status: 500 });
  }
}
