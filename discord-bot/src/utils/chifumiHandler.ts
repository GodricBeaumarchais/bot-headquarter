import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { DatabaseManager } from './database';
import { CURRENCY_NAME } from './constants';

export async function handleChifumiAccept(interaction: ButtonInteraction, gameId: string) {
    try {
        // Récupérer le jeu
        const game = await DatabaseManager.getChifumiGame(gameId);
        
        if (!game) {
            await interaction.reply({
                content: '❌ Jeu non trouvé ou expiré.',
                ephemeral: true
            });
            return;
        }

        // Vérifier que c'est bien l'opposant qui accepte
        if (game.opponentId !== interaction.user.id) {
            await interaction.reply({
                content: '❌ Seul l\'utilisateur défié peut accepter ce défi.',
                ephemeral: true
            });
            return;
        }

        // Vérifier que le jeu est encore en attente
        if (game.status !== 'PENDING') {
            await interaction.reply({
                content: '❌ Ce défi a déjà été traité.',
                ephemeral: true
            });
            return;
        }

        // Vérifier que le jeu n'a pas expiré
        if (new Date() > game.expiresAt) {
            await interaction.reply({
                content: '❌ Ce défi a expiré.',
                ephemeral: true
            });
            return;
        }

        // Activer le jeu
        await DatabaseManager.activateChifumiGame(gameId);

        // Calculer le score actuel
        let challengerWins = 0;
        let opponentWins = 0;
        
        game.rounds.forEach((round: any) => {
            if (round.winnerId === game.challengerId) {
                challengerWins++;
            } else if (round.winnerId === game.opponentId) {
                opponentWins++;
            }
        });

        // Créer l'embed de jeu actif
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🎮 Partie de Chifumi en cours !')
            .setDescription(`${game.challenger.username} vs ${game.opponent.username}`)
            .addFields(
                { name: '💰 Mise', value: `${game.betAmount} ${CURRENCY_NAME}`, inline: true },
                { name: '🎯 Manche', value: `${game.currentRound}/${game.totalRounds}`, inline: true },
                { name: '📊 Score', value: `${challengerWins} - ${opponentWins}`, inline: true }
            )
            .setFooter({ text: `ID: ${game.gameId} | Premier à ${Math.ceil(game.totalRounds/2)} victoires` })
            .setTimestamp();

        // Créer les boutons pour les choix
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`chifumi_choice_${gameId}_rock`)
                    .setLabel('🪨 Pierre')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`chifumi_choice_${gameId}_paper`)
                    .setLabel('📄 Papier')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`chifumi_choice_${gameId}_scissors`)
                    .setLabel('✂️ Ciseaux')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.update({
            embeds: [embed],
            components: [row]
        });

    } catch (error) {
        console.error('Erreur lors de l\'acceptation du défi:', error);
        await interaction.reply({
            content: '❌ Une erreur s\'est produite.',
            ephemeral: true
        });
    }
}

export async function handleChifumiDecline(interaction: ButtonInteraction, gameId: string) {
    try {
        // Récupérer le jeu
        const game = await DatabaseManager.getChifumiGame(gameId);
        
        if (!game) {
            await interaction.reply({
                content: '❌ Jeu non trouvé.',
                ephemeral: true
            });
            return;
        }

        // Vérifier que c'est bien l'opposant qui refuse
        if (game.opponentId !== interaction.user.id) {
            await interaction.reply({
                content: '❌ Seul l\'utilisateur défié peut refuser ce défi.',
                ephemeral: true
            });
            return;
        }

        // Annuler le jeu
        await DatabaseManager.cancelChifumiGame(gameId);

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Défi refusé')
            .setDescription(`${game.opponent.username} a refusé le défi de ${game.challenger.username}`)
            .setTimestamp();

        await interaction.update({
            embeds: [embed],
            components: []
        });

    } catch (error) {
        console.error('Erreur lors du refus du défi:', error);
        await interaction.reply({
            content: '❌ Une erreur s\'est produite.',
            ephemeral: true
        });
    }
}

export async function handleChifumiChoice(interaction: ButtonInteraction, gameId: string, choice: string) {
    try {
        // Récupérer le jeu
        const game = await DatabaseManager.getChifumiGame(gameId);
        
        if (!game) {
            await interaction.reply({
                content: '❌ Jeu non trouvé ou expiré.',
                ephemeral: true
            });
            return;
        }

        // Vérifier que le jeu est actif
        if (game.status !== 'ACTIVE') {
            await interaction.reply({
                content: '❌ Ce jeu n\'est pas actif.',
                ephemeral: true
            });
            return;
        }

        // Vérifier que l'utilisateur participe au jeu
        if (game.challengerId !== interaction.user.id && game.opponentId !== interaction.user.id) {
            await interaction.reply({
                content: '❌ Vous ne participez pas à ce jeu.',
                ephemeral: true
            });
            return;
        }

        // Convertir le choix en format de base de données
        let dbChoice: 'ROCK' | 'PAPER' | 'SCISSORS';
        switch (choice) {
            case 'rock':
                dbChoice = 'ROCK';
                break;
            case 'paper':
                dbChoice = 'PAPER';
                break;
            case 'scissors':
                dbChoice = 'SCISSORS';
                break;
            default:
                await interaction.reply({
                    content: '❌ Choix invalide.',
                    ephemeral: true
                });
                return;
        }

        // Déterminer la manche actuelle
        const currentRound = game.rounds.find(round => 
            !round.challengerChoice || !round.opponentChoice
        );

        if (!currentRound) {
            await interaction.reply({
                content: '❌ Aucune manche en cours.',
                ephemeral: true
            });
            return;
        }

        // Vérifier que l'utilisateur n'a pas déjà fait son choix
        const isChallenger = game.challengerId === interaction.user.id;
        if (isChallenger && currentRound.challengerChoice) {
            await interaction.reply({
                content: '❌ Vous avez déjà fait votre choix pour cette manche.',
                ephemeral: true
            });
            return;
        }
        if (!isChallenger && currentRound.opponentChoice) {
            await interaction.reply({
                content: '❌ Vous avez déjà fait votre choix pour cette manche.',
                ephemeral: true
            });
            return;
        }

        // Faire le choix
        await DatabaseManager.makeChifumiChoice(gameId, interaction.user.id, dbChoice, currentRound.roundNumber);

        // Confirmer le choix
        await interaction.reply({
            content: `✅ Vous avez choisi ${choice === 'rock' ? '🪨 Pierre' : choice === 'paper' ? '📄 Papier' : '✂️ Ciseaux'} !`,
            ephemeral: true
        });

        // Vérifier si les deux joueurs ont fait leur choix
        const updatedGame = await DatabaseManager.getChifumiGame(gameId);
        if (updatedGame) {
            const updatedRound = updatedGame.rounds.find(round => round.roundNumber === currentRound.roundNumber);
            
            if (updatedRound && updatedRound.challengerChoice && updatedRound.opponentChoice) {
                // Les deux joueurs ont fait leur choix, mettre à jour l'embed
                await updateGameEmbed(interaction, updatedGame, updatedRound);
            }
        }

    } catch (error) {
        console.error('Erreur lors du choix chifumi:', error);
        await interaction.reply({
            content: '❌ Une erreur s\'est produite lors du choix.',
            ephemeral: true
        });
    }
}

async function updateGameEmbed(interaction: ButtonInteraction, game: any, lastRound?: any) {
    try {
        // Calculer le score
        let challengerWins = 0;
        let opponentWins = 0;
        
        game.rounds.forEach((round: any) => {
            if (round.winnerId === game.challengerId) {
                challengerWins++;
            } else if (round.winnerId === game.opponentId) {
                opponentWins++;
            }
        });

        // Déterminer la manche actuelle
        const currentRound = game.rounds.find((round: any) => 
            !round.challengerChoice || !round.opponentChoice
        );

        // Déterminer la couleur et le titre selon le résultat de la dernière manche
        let embedColor = 0x00FF00; // Vert par défaut
        let embedTitle = '🎮 Partie de Chifumi en cours !';
        let embedDescription = `${game.challenger.username} vs ${game.opponent.username}`;

        if (lastRound && lastRound.challengerChoice && lastRound.opponentChoice) {
            if (lastRound.winnerId === null) {
                // Égalité
                embedColor = 0xFFA500; // Orange
                embedTitle = '🤝 Égalité ! Manche de départage';
                embedDescription = `${game.challenger.username} vs ${game.opponent.username}\n\n🔄 Une manche de départage va être créée !`;
            } else {
                // Victoire
                const winner = lastRound.winnerId === game.challengerId ? game.challenger.username : game.opponent.username;
                embedColor = 0x00FF00; // Vert
                embedTitle = `🎯 Manche ${lastRound.roundNumber} terminée !`;
                embedDescription = `${game.challenger.username} vs ${game.opponent.username}\n\n🏆 ${winner} remporte cette manche !`;
            }
        }

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(embedTitle)
            .setDescription(embedDescription)
            .addFields(
                { name: '💰 Mise', value: `${game.betAmount} ${CURRENCY_NAME}`, inline: true },
                { name: '🎯 Manche', value: currentRound ? `${currentRound.roundNumber}/${game.totalRounds}` : `${game.totalRounds}/${game.totalRounds}`, inline: true },
                { name: '📊 Score', value: `${challengerWins} - ${opponentWins}`, inline: true }
            )
            .setFooter({ text: `ID: ${game.gameId} | Premier à ${Math.ceil(game.totalRounds/2)} victoires` })
            .setTimestamp();

        // Si le jeu est terminé, ne plus afficher les boutons
        if (game.status === 'FINISHED') {
            const winner = challengerWins > opponentWins ? game.challenger.username : game.opponent.username;
            embed.setTitle('🏆 Partie terminée !')
                .setDescription(`🎉 ${winner} remporte la partie !`)
                .setColor(0xFFD700);

            await interaction.message.edit({
                embeds: [embed],
                components: []
            });
        } else if (currentRound) {
            // Afficher les boutons pour la manche suivante
            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`chifumi_choice_${game.gameId}_rock`)
                        .setLabel('🪨 Pierre')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`chifumi_choice_${game.gameId}_paper`)
                        .setLabel('📄 Papier')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`chifumi_choice_${game.gameId}_scissors`)
                        .setLabel('✂️ Ciseaux')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.message.edit({
                embeds: [embed],
                components: [row]
            });
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'embed:', error);
    }
} 