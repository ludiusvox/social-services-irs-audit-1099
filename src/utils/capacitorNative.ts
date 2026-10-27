import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
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
 * Native file share / email launcher (passes generated PDF / statement file to Gmail, Outlook Mobile, or System Share)
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
