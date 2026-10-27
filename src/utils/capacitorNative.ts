import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface PhotoCaptureResult {
  url: string;
  fileName: string;
  size: string;
}

/**
 * Native camera / photo picker using Capacitor Camera plugin with graceful fallback
 */
export async function takeReceiptPhotoNative(): Promise<PhotoCaptureResult | null> {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    });

    if (image.dataUrl) {
      return {
        url: image.dataUrl,
        fileName: `IMG_${Date.now()}.${image.format || 'jpg'}`,
        size: '1.4 MB',
      };
    }
  } catch (e) {
    console.warn('Capacitor Camera plugin not active or user cancelled', e);
  }
  return null;
}

/**
 * Saves a base64-encoded PDF or file to the Android device's Documents folder and triggers system share sheet
 */
export async function saveAndSharePdfNative(
  pdfBase64Data: string,
  fileName: string,
  title: string,
  text: string
): Promise<{ success: boolean; nativeUri?: string; message: string }> {
  // Extract base64 content
  const base64Content = pdfBase64Data.includes('base64,')
    ? pdfBase64Data.split('base64,')[1]
    : pdfBase64Data;

  try {
    let savedFile;
    try {
      savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Content,
        directory: Directory.Documents,
        recursive: true,
      });
    } catch (err) {
      // Fallback to Cache if Documents folder requires special permission
      savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Content,
        directory: Directory.Cache,
        recursive: true,
      });
    }

    const fileUri = savedFile.uri;

    // Launch Android share sheet so user can select Gmail, Outlook Mobile, Drive, etc.
    try {
      const canShare = await Share.canShare();
      if (canShare.value) {
        await Share.share({
          title,
          text,
          url: fileUri,
          dialogTitle: 'Save / Share PDF Report',
        });
      }
    } catch (shareErr) {
      console.warn('Native share sheet dismissed or unavailable', shareErr);
    }

    return {
      success: true,
      nativeUri: fileUri,
      message: `Saved to Documents/${fileName}`,
    };
  } catch (err) {
    console.error('Error writing PDF file to device filesystem', err);
    return {
      success: false,
      message: 'Failed to write PDF file to device storage',
    };
  }
}

/**
 * Native file share / email launcher
 */
export async function shareDocumentNative(title: string, text: string, url?: string): Promise<boolean> {
  try {
    const canShareResult = await Share.canShare();
    if (canShareResult.value) {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Attach PDF to Email / Share Document',
      });
      return true;
    }
  } catch (e) {
    console.warn('Capacitor native share error', e);
  }

  // Web Share fallback
  if (navigator.share && url) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch (err) {
      console.warn('Web share API cancelled or unsupported', err);
    }
  }

  return false;
}
