import { message } from '@tauri-apps/plugin-dialog';

/**
 * Affiche une fenêtre contextuelle d'erreur native.
 * @param title Le titre de la fenêtre.
 * @param errorMessage Le message d'erreur à afficher.
 */
export async function showError(errorMessage: string, title: string = "Erreur") {
    try {
        await message(errorMessage, {
            title: title,
            kind: 'error',
            okLabel: 'Compris'
        });
    } catch (err) {
        console.error("Impossible d'afficher la popup d'erreur:", err);
        // Fallback sur une alerte classique si le plugin échoue
        alert(`${title}: ${errorMessage}`);
    }
}

/**
 * Affiche une fenêtre contextuelle d'information native.
 */
export async function showInfo(infoMessage: string, title: string = "Information") {
    try {
        await message(infoMessage, {
            title: title,
            kind: 'info',
            okLabel: 'OK'
        });
    } catch (err) {
        console.error("Impossible d'afficher la popup d'info:", err);
        alert(`${title}: ${infoMessage}`);
    }
}
