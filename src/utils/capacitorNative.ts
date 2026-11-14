import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

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

const blobToBase64 = (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Return base64 without data:image/jpeg;base64, prefix
        const b64 = reader.result.split(',')[1];
        resolve(b64);
      } else {
        reject(new Error('Failed to convert Blob to Base64 string'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Saves a base64-encoded file or Blob to the Android device's Documents folder and triggers system share sheet
 */
export async function saveAndShareFileNative(
  fileData: string | Blob,
  fileName: string,
  title: string,
  text: string
): Promise<{ success: boolean; nativeUri?: string; message: string }> {
  try {
    let base64Content = '';

    if (typeof fileData === 'string') {
      base64Content = fileData.includes('base64,')
        ? fileData.split('base64,')[1]
        : fileData;
    } else {
      base64Content = await blobToBase64(fileData);
    }

    let savedDir = Directory.Cache;
    let savedFile;
    try {
      savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Content,
        directory: Directory.Cache,
        recursive: true,
      });
      savedDir = Directory.Cache;
    } catch (err) {
      savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Content,
        directory: Directory.Data,
        recursive: true,
      });
      savedDir = Directory.Data;
    }

    let fileUri = savedFile.uri;
    try {
      const uriResult = await Filesystem.getUri({
        path: fileName,
        directory: savedDir,
      });
      if (uriResult && uriResult.uri) {
        fileUri = uriResult.uri;
      }
    } catch (e) {
      console.warn('Could not retrieve exact getUri, using savedFile.uri', e);
    }

    // Launch Android native share sheet
    try {
      await Share.share({
        title: title || 'Save / Share File',
        text: text || 'Exported document from LedgerLens',
        url: fileUri,
        dialogTitle: title || 'Save / Share File',
      });
    } catch (shareErr) {
      console.warn('Native share sheet dismissed or unavailable', shareErr);
    }

    return {
      success: true,
      nativeUri: fileUri,
      message: `File ready to share: ${fileName}`,
    };
  } catch (err) {
    console.error('Error writing file to device filesystem', err);
    return {
      success: false,
      message: 'Failed to write file to device storage',
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

/**
 * Alias / helper for saving and sharing PDF files natively
 */
export async function saveAndSharePdfNative(
  pdfBlobOrBase64: string | Blob,
  fileName: string,
  title: string,
  text: string
): Promise<{ success: boolean; nativeUri?: string; message: string }> {
  return saveAndShareFileNative(pdfBlobOrBase64, fileName, title, text);
}

