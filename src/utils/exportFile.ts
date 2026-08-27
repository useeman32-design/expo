import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

import { buildXlsx } from './xlsx';

/**
 * Report exports: Excel (.xlsx) and PDF.
 *  - Excel: real workbook (see utils/xlsx.ts) — downloaded in the browser,
 *    shared via the native sheet on devices.
 *  - PDF: a print-ready HTML statement — native print sheet (save as PDF)
 *    on devices, the browser print dialog on web.
 */

export type ExportResult = 'ok' | 'failed';

export async function exportExcel(
  rows: (string | number)[][],
  filename: string,
  sheetName = 'Statement',
): Promise<ExportResult> {
  try {
    const name = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    const bytes = new Uint8Array(buildXlsx(rows, sheetName));

    if (Platform.OS === 'web') {
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      return 'ok';
    }

    const file = new File(Paths.cache, name);
    file.write(bytes);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export statement',
      });
    }
    return 'ok';
  } catch {
    return 'failed';
  }
}

export async function exportPdfHtml(html: string): Promise<ExportResult> {
  try {
    if (Platform.OS === 'web') {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
      document.body.appendChild(iframe);
      const doc = iframe.contentDocument;
      if (!doc) return 'failed';
      doc.open();
      doc.write(html);
      doc.close();
      const go = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          /* user can retry */
        }
      };
      iframe.onload = go;
      setTimeout(go, 400);
      setTimeout(() => iframe.remove(), 120_000);
      return 'ok';
    }
    await Print.printAsync({ html });
    return 'ok';
  } catch {
    return 'failed';
  }
}
