/*
	Jack is treadted as 11
	Queen is treated as 12
	King is treated as 13
	Ace is treated as 1
*/

const GAME_SETTINGS = {
	numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
	signs: ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
	amounts: {
		total: 52,
		dealDeck: 24,
		decks: [1, 2, 3, 4, 5, 6, 7], // amount of cards in every playing deck
		deal: 1
	},
	suits: [0, 1, 2, 3], //hearts, diamonds, clovers, spades
	suitsNames: ['hearts', 'diamonds', 'clovers', 'spades'],
	colors: [0, 1] //red, black
};

window.addEventListener('load', function() {
	new Game();
});

function Game() {
	this.dealDeck = null;
	this.finishDecks = [];
	this.playDecks = [];

	this.$stashContainer = document.getElementById('stashDecks');
	this.$playContainer = document.getElementById('playDecks');
	this.$el = document.getElementById('game');

	this.cardKits = this.generateCardKits();

	this.createDecks();
	this.registerEvents();
}

function DealDeck() {
	Deck.apply(this, arguments);

	this.$el.classList.add('flat');
	this.$wrapper.classList.add('col-3');
}

function FinishDeck() {
	Deck.apply(this, arguments);

	this.$el.classList.add('flat');

	this.cards = [];
	this.suit = null;
}

function PlayingDeck(cardsKit) {
	Deck.apply(this, arguments);

	this.openLastCard();
}

function Deck(cardKits) {
	this.cards = [];

	this.$el = document.createElement('div');
	this.$wrapper = document.createElement('div');

	if (cardKits.length) {
		this.createCards(cardKits);
	}


	this.$wrapper.appendChild(this.$el);
	this.$wrapper.classList.add('col');
	this.$el.classList.add('deck');

	this.registerEvents();
}

function Card(cardKit) {
	this.color = cardKit.color;
	this.suit = cardKit.suit;
	this.number = cardKit.number;
	this.isOpen = false;

	this.$el = document.createElement('div');
	this.$el.classList.add('card', GAME_SETTINGS.suitsNames[cardKit.suit]);
	this.$el.innerText = GAME_SETTINGS.signs[cardKit.number];

	this.registerEvents();
}

Game.prototype = {
	createDecks: function() {
		let kits = this.getShuffledDecks();

		this.$stashContainer.innerHTML = '';
		this.$playContainer.innerHTML = '';

		this.dealDeck = new DealDeck(kits.splice(0, GAME_SETTINGS.amounts.dealDeck));
		this.$stashContainer.appendChild(this.dealDeck.$wrapper);

        for (let i = 0; i < GAME_SETTINGS.suits.length; ++i){
            this.finishDecks[i] = new FinishDeck([]);

            this.$stashContainer.appendChild(this.finishDecks[i].$wrapper);
        }

        for (let i = 0; i < GAME_SETTINGS.amounts.decks.length; ++i) {
            this.playDecks[i] = new PlayingDeck(kits.splice(0, GAME_SETTINGS.amounts.decks[i]));

            this.$playContainer.appendChild(this.playDecks[i].$wrapper);
        }
	},

	getShuffledDecks: function() {
		let kits = this.cardKits.slice();
		let shuffledKits = [];

		while (kits.length) {
			let randomIndex = Math.round(Math.random() * (kits.length - 1));

			shuffledKits.push(kits.splice(randomIndex, 1)[0]);
		}

		return shuffledKits;
	},

	generateCardKits: function() {
        let deck = [];
        for (let i = 0; i < 4; i++){
            for (let j = 1; j < 14; j++){
                deck.push({color:Math.round(i/4),suit:i,number:j});
            }
        }

        return deck;
	},

	registerEvents: function() {
		this.$el.addEventListener('deck.click', this.onDeckClick().bind(this));
        this.$el.addEventListener("deckDblclick", this.onDeckDoubleClick.bind(this));
	},

    onDeckDoubleClick: function (e) {

        let card = e.detail.card;
        let finDecks = this.finishDecks;
        let deckFrom = e.detail.deck;

        for(let i = 0; i < finDecks.length; ++i){
            if(this.moveCards(deckFrom, finDecks[i], card)){
                return;
            }
        }

        if(this.isWin(finDecks)){
            alert('You win!');
        }
    },

	onDeckClick: function() {
		let selectedDeck = null;
		let selectedCards = [];
        let finDecks = this.finishDecks;

		return function(e) {
			let deck = e.detail.deck;
			let cards = e.detail.cards;

            if (selectedDeck) {
                if(this.moveCards(selectedDeck, deck, selectedCards)){
                    selectedDeck = null;
                    selectedCards = [];
                    deck.unselectCards();
                } else if(selectedDeck === deck ){
                    selectedDeck.unselectCards();
                    selectedDeck = null;
                    selectedCards = [];
                } else {
                    selectedDeck.unselectCards();
                    selectedDeck = deck;
                    selectedCards = cards;
                }
                if(this.isWin(finDecks)){
                    alert('You win!');
                }
            }
            else {
                selectedDeck = deck;
                selectedCards = cards;
            }

		}

	},

	moveCards: function(deckFrom, deckTo, cards) {
        if(deckTo && deckFrom && cards){
            if (deckTo.addCards(cards)) {
                deckFrom.removeCards(cards);

                return true;
            }
        }
		return false;
	},

	isWin: function(finishDecks){
	    for(let i = 0; i < finishDecks.length; ++i){
	        if(finishDecks[i].length !== 13){
	            return false;
            }
        }
        return true;
    }
};

Deck.prototype = {
	createCards: function(cardKits) {
		for(let i = 0; i < cardKits.length; i++) {
			let card = new Card(cardKits[i]);

			this.$el.appendChild(card.$el);
			this.cards.push(card);
		}
	},

	registerEvents: function() {
		this.$el.addEventListener('card.click', this.onCardClick.bind(this));
		this.$el.addEventListener('click', this.onClick.bind(this));
        this.$el.addEventListener('cardDblclick', this.onCardDoubleClick.bind(this));
	},

    onCardDoubleClick: function (e) {
        let cards = [e.detail.card];
        let event = new CustomEvent('deckDblclick', {
            bubbles: true,
            detail: {
                deck: this,
                card: cards,
            }
        });
        this.$el.dispatchEvent(event);
    },

	onCardClick: function(e) {
		let cards = this.getSelectedCards(e.detail.card);

		this.$el.dispatchEvent(new CustomEvent('deck.click', {
			bubbles: true,
			detail: {
				deck: this,
				cards: cards
			}
		}));
	},

	getSelectedCards: function(card) {
		let cardIndex = this.cards.indexOf(card);
		let cards = this.cards.slice(cardIndex);

		this.unselectCards();
		cards.forEach((card) => card.select());

		return cards;
	},

	unselectCards: function() {
		this.cards.forEach((card) => card.unselect());
	},

	getCardIndex: function(card) {
		for(let i = 0; i < this.cards.length; i++) {
			let currentCard = this.cards[i];

			if (currentCard.color === card.color && currentCard.number === card.number && currentCard.suit === card.suit) {
				return i;
			}
		}

		return -1;
	},

	addCards: function(cards) {
		if (!this.verifyTurn(cards)) {
			return false;
		}
		for(let i = 0; i < cards.length; i++) {
			this.$el.appendChild(cards[i].$el);
			this.cards.push(cards[i]);
		}

		return true;
	},

	removeCards: function(cards) {
		let cardIndex = this.getCardIndex(cards[0]);

		this.cards.splice(cardIndex);
	},

	verifyTurn: function(cards) {

		let upperCard = cards[0];
		let cardTo = this.cards.slice(-1).pop();
        if(upperCard) {
            return (!cardTo && upperCard.number === 13)
                || (cardTo && upperCard.color !== cardTo.color
                    && cardTo.number - upperCard.number === 1);
        }
	},

	onClick: function(e) {
		this.$el.dispatchEvent(new CustomEvent('deck.click', {
			bubbles: true,
			detail: {
				deck: this,
				cards: []
			}
		}));
	}
};

Card.prototype = {
	select: function() {
		this.$el.classList.add('selected');
	},

	unselect: function() {
		this.$el.classList.remove('selected');
	},

	open: function() {
		this.$el.classList.add('open');
		this.isOpen = true;
	},

	close: function() {
		this.$el.classList.remove('open');
		this.isOpen = false;
	},

	isClosed: function() {
		return !this.isOpen;
	},

	onClick: function(e) {
		e.stopPropagation();
		
		this.$el.dispatchEvent(new CustomEvent('card.click', {
			bubbles: true,
			detail: {
				card: this
			}
		}));
	},

	onDoubleClick: function(e) {

        let event  = new CustomEvent('cardDblclick', {
            bubbles: true,
            detail:{
                card:this
            }
        });
        this.$el.dispatchEvent(event);

	},

	registerEvents: function() {
		this.$el.addEventListener('click', this.onClick.bind(this));
		this.$el.addEventListener('dblclick', this.onDoubleClick.bind(this));
	}
};

DealDeck.prototype = Object.assign(Object.create(Deck.prototype), {
	onClick: function() {
		let closedCard = this.getFirstClosedCard();

		if (closedCard) {
			this.getFirstClosedCard().open();
		} else {
			this.revert();
		}

		this.$el.dispatchEvent(new CustomEvent('deck.click', {
			bubbles: true,
			detail: {
				deck: null
			}
		}));
	},

	getFirstClosedCard: function() {
		return this.cards.filter((card) => card.isClosed())[0];
	},

	revert: function() {
		this.cards.forEach((card) => card.close());
	},

	addCards: function() {
		return false;
	},

	getSelectedCards: function(card) {
		card.select();

		return [card];
	},

	removeCards: function(cards) {
		let cardIndex = this.getCardIndex(cards[0]);

		this.cards.splice(cardIndex, 1);
	}
});

FinishDeck.prototype = Object.assign(Object.create(Deck.prototype), {
    verifyTurn: function(cards) {

        let upperCard = cards[0];
        let cardTo = this.cards.slice(-1).pop();

        if(upperCard) {
            return (!cardTo && upperCard.number === 1)
                || (cardTo && upperCard.suit === cardTo.suit
                    && upperCard.number - cardTo.number === 1 && cards.length === 1);
        }
    }
});

PlayingDeck.prototype = Object.assign(Object.create(Deck.prototype), {
	openLastCard: function() {
		if (this.cards.length) {
			this.cards.slice(-1).pop().open();
		}
	},

	removeCards: function() {
		Deck.prototype.removeCards.apply(this, arguments);

		this.openLastCard();
	}
});