// Configuration de la monnaie
export const CURRENCY_NAME = 'Atmas';
// Émotes pour différentes quantités de pièces
export const COIN_EMOTE = '🪙';        // Une pièce
export const PILE_EMOTE = '💵';        // Pile de 10 pièces (billet)
export const BAG_EMOTE = '💰';         // Sac de 100 pièces (sac de CURRENCY_SYMBOL)

// Configuration du bot
export const BOT_PREFIX = '!hq';

// Récompenses
export const DAILY_REWARD = 1;
export const STARTING_BALANCE = 5;
export const STREAK_BONUS = 5; // Bonus tous les 5 jours

// Configuration OOTD (Outfit of the Day)
export const OOTD_CHANNEL_ID = process.env.OOTD_CHANNEL_ID || '';
export const OOTD_REACTIONS_NEEDED = 10; // Nombre de réactions nécessaires
export const OOTD_REWARD =10; // Récompense en tokens
export const OOTD_REACTION_EMOJI = '👗'; // Émoji de réaction 

// Configuration des rôles
export const DEFAULT_ROLE_ID = process.env.DEFAULT_ROLE_ID || '';
export const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || ''; 