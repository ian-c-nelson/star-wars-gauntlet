var starWarsRPG = (function () {
    'use strict'

    var gameData = {
        inProgress: false,
        champion: "",
        enemy: "",
        defeatedEnemies: 0,
        characters: [
            {
                id: "luke-skywalker",
                health: 150,
                attackPower: 11,
                counterAttack: 10,
                maxHealth: 150,
                baseAttackPower: 8
            },
            {
                id: "obi-wan-kenobi",
                health: 175,
                attackPower: 9,
                counterAttack: 12,
                maxHealth: 175,
                baseAttackPower: 6
            },
            {
                id: "darth-maul",
                health: 200,
                attackPower: 7,
                counterAttack: 15,
                maxHealth: 200,
                baseAttackPower: 4
            },
            {
                id: "darth-vader",
                health: 250,
                attackPower: 4,
                counterAttack: 17,
                maxHealth: 250,
                baseAttackPower: 7
            },
        ],

        messages: {
            initial: "Click a character to select them as your champion.<br>Your chosen Champion will fight the remaining characters until they have all fallen (or he has)!",
            selectEnemy: "Click a character to battle to the death!",
            selectEnemy2: "You were victorious! Click another character to battle to the death!",
            battle: "Battle has commenced! Click Attack to destroy your enemy!",
            victory: "You have defeated all of your enemies! Click 'Play again' to start a new Gauntlet.",
            defeat: "You have fallen in battle. Click 'Play again' to start a new Gauntlet."
        }
    };

    var gameController = {

        init: function () {
            // Reset characters' status.
            gameData.characters.forEach(function (character) {
                character.health = character.maxHealth;
                character.attackPower = character.baseAttackPower;
            });

            // Reset game status
            gameData.champion = "";
            gameData.enemy = "";
            gameData.defeatedEnemies = 0;
            gameData.inProgress = false;

            // reset the ui
            uiController.resetUI();

            // Log state
            this.logState();
        },

        onButtonClick: function () {
            var val = $(this).val();
            // using switch to handle buttons in case I want to expand functinality later (strong attack/weak attack/some other button)
            switch (val) {
                case "reset":
                    gameController.init();
                    break;

                case "attack":
                    gameController.doAttack();
                    break;
            }
            
            // Log state
            gameController.logState();
        },

        onCharacterClick: function (event) {
            // Don't do anything if the character is defeated
            if($(this).hasClass("defeated")) {
                return;
            }

            // Get the clicked character id
            var charId = $(this).data("characterId");

            // Set the game in progress.
            if (!gameData.inProgress) {
                gameData.inProgress = true;
            }

            if (!gameData.champion) {
                // Set the game in progress.
                gameData.inProgress = true;

                // set the clicked character as the selected champion
                gameData.champion = charId;

                // move the selected champion to the 
                uiController.moveChampion();

                // update the message
                uiController.updateMessage(gameData.messages.selectEnemy);
            } else if (!gameData.enemy) {
                // set the clicked character as the selected enemy
                gameData.enemy = charId;

                // set the enemy as active
                uiController.moveEnemy();
            }

            //show the battle area if both fighters are selected
            if (gameData.champion && gameData.enemy) {
                uiController.showBattleArea(true);
                uiController.showCharactersArea(false);
                uiController.updateMessage(gameData.messages.battle);
            }

            // Log state
            gameController.logState();
        },

        onKeyUp: function (event) {
            // add hot keys for attack and reset (stretch goal);
        },

        doAttack: function () {
            // get the characters
            var attacker = gameController.getCharacter(gameData.champion);
            var defender = gameController.getCharacter(gameData.enemy);

            // update the defender's health
            defender.health -= attacker.attackPower;
            uiController.updateCharacterHealth(defender);

            if (defender.health <= 0) {
                // if the defender's health is depleted mark him as defeated
                gameData.defeatedEnemies++;

                // if there are any enemies left set the stage to select the next battle
                if (gameData.defeatedEnemies < gameData.characters.length - 1) {
                    uiController.moveDefeatedCharacter(gameData.enemy);
                    gameData.enemy = "";
                    uiController.showBattleArea(false);
                    uiController.showCharactersArea(true);
                    uiController.updateMessage(gameData.messages.selectEnemy2);
                    return;
                } else {
                    // if all of the enemies are defeated, end the game in victory.
                    uiController.showAttackButton(false);
                    uiController.showResetButton(true);
                    uiController.updateMessage(gameData.messages.victory);
                    gameData.inProgress = false;
                    return;
                }
            } else {
                // if the defender is still alive update the attacker's health and AP.
                attacker.health -= defender.counterAttack;
                attacker.attackPower += attacker.baseAttackPower;
                uiController.updateCharacterHealth(attacker);
            }

            // If the champion's health is depleted end the game in defeat
            if (attacker.health <= 0) {
                uiController.showAttackButton(false);
                uiController.showResetButton(true);
                uiController.updateMessage(gameData.messages.defeat);
                gameData.inProgress = false;
            }
        },

        getCharacter: function (id) {
            return $.grep(gameData.characters, function (c) {
                return c.id === id;
            })[0];
        },

        logState: function (key) {
            // log a separator
            console.log("------------------------------------------------");

            // Log the selected character
            console.log("Champion: " + gameData.champion);
            var champ = this.getCharacter(gameData.champion);
            if (champ) {
                console.log("Champion Health: " + champ.health);
                console.log("Champion AP: " + champ.attackPower);
            }

            // log the selected enemy
            console.log("Enemy: " + gameData.enemy)
            var enemy = this.getCharacter(gameData.enemy);
            if (enemy) {
                console.log("Enemy Health: " + enemy.health);
                console.log("Enemy CAP: " + enemy.counterAttack);
            }

            // log the defeated enemy count
            console.log("Defeated Enemies: " + gameData.defeatedEnemies)

            // log the enemies count
            console.log("Total Enemies: " + (gameData.characters.length - 1));

            // log the in progress flag
            console.log("Game in Progress: " + gameData.inProgress);

            // log a separator
            console.log("------------------------------------------------");
        }

    };

    var uiController = {
        resetUI: function () {

            // Reset characters' status.
            gameData.characters.forEach(function (character) {
                // Move the caracters back to the characters row and update their health text.
                var characterSelector = ".character[data-character-id=\"" + character.id + "\"]";
                var targetAreaSelector = "#characters-area ." + character.id;


                $(characterSelector).toggleClass("defeated", false).appendTo(targetAreaSelector);
                $(targetAreaSelector).removeClass("hidden");
                uiController.updateCharacterHealth(character);
            });

            // initialize areas
            this.showCharactersArea(true);
            this.showBattleArea(false);
            this.showResetButton(false);
            this.showAttackButton(true);

            // initialize the message
            this.updateMessage(gameData.messages.initial);
        },

        updateCharacterHealth: function (character) {
            var selector = ".character[data-character-id=\"" + character.id + "\"] .health-value";
            $(selector).text(character.health);
        },

        updateMessage: function (message) {
            $("#message-text").html(message);
        },

        showCharactersArea: function (show) {
            $("#characters-area").toggleClass("hidden", !show);
        },

        showBattleArea: function (show) {
            $("#battle-area").toggleClass("hidden", !show);
        },

        showAttackButton: function (show) {
            $("#attack-button").toggleClass("hidden", !show);
        },

        showResetButton: function (show) {
            $("#reset-button").toggleClass("hidden", !show);
        },

        moveChampion: function () {
            var selector = ".character[data-character-id=\"" + gameData.champion + "\"]";
            $(selector).closest(".col").addClass("hidden");
            $(selector).appendTo("#battle-area .attacker");
        },

        moveDefeatedCharacter: function (characterId) {
            var characterSelector = ".character[data-character-id=\"" + characterId + "\"]";
            var targetAreaSelector = "#characters-area ." + characterId;
            $(characterSelector).addClass("defeated").appendTo(targetAreaSelector);
            $(targetAreaSelector).removeClass("hidden");
        },

        moveEnemy: function () {
            var selector = ".character[data-character-id=\"" + gameData.enemy + "\"]";
            $(selector).closest(".col").toggleClass("hidden", true);
            $(selector).appendTo("#battle-area .defender");
        }




    };

    // bind the key up event
    $(document).on("keyup", gameController.onKeyUp);

    // bind the click events
    $(".character").on("click", gameController.onCharacterClick);
    $(".btn").on("click", gameController.onButtonClick);

    // initialize the game
    gameController.init();
})();