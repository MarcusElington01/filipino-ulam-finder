import { toastController } from '@ionic/vue';

export async function showToast(message: string, color: 'success' | 'warning' | 'danger' | 'medium' = 'success') {
  const toast = await toastController.create({
    message,
    duration: 1600,
    color,
    position: 'bottom'
  });
  await toast.present();
}
