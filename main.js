let app;
let listing = null;
let isAutomated = false;
let block = false;
let waiting = false;
let hackProgress = 0;
let wordLoop = null;
let minerLoop = null;
let upgradeLoop = null;
let myBT = 0;
let botWindow;
let isDragReady = false;
let dragOffset = {
	x: 0,
	y: 0
};
let minerStatus = [
	{
		name: "shop-basic-miner",
		value: 0
	},
	{
		name: "shop-advanced-miner",
		value: 0
	},
	{
		name: "shop-mining-drill",
		value: 0
	},
	{
		name: "shop-data-center",
		value: 0
	},
	{
		name: "shop-bot-net",
		value: 0
	},
	{
		name: "shop-quantum-server",
		value: 0
	}
];
let maxStats = {
	charge: 30,
	strength: 4,
	regen: 10
};
const firewalls = ["1", "2", "3"];
const ocrApiKey = "XXX";
const db = "https://raw.githubusercontent.com/bozoweed/Bot-s0urce.io/master/db.json";
let message = "We Are Anonymous, Expect Us !";
let wordFreqMin = 600
let wordFreqMax = 650
let wordFreq = 0;
let mineFreq = 3000;
let blockFreq = 1000;
let upgradeFreq = 5000;
let minerLevel = 5000;

let lastFirewallUpdated=0;

let playerToAttack = 0;

app = {
	start: () => {
		$.get(db).done((data) => {
			listing = JSON.parse(data);
			app.automate();
		});
	},

	exportListing: () => {
		log(JSON.stringify(listing, null, 2));
	},

	automate: () => {
		// first check the windows are open, and open them if they aren't
		if ($("#player-list").is(":visible") === false) {
			log("* Target list must be open");
			$("#desktop-list").children("img").click();
		}
		if ($("#window-shop").is(":visible") === false) {
			log("* Black market must be open");
			$("#desktop-shop").children("img").click();
			$("#desktop-miner").children("img").click();
		}
		if ($("#window-computer").is(":visible") === false) {
			log("* My computer must be open");
			$("#desktop-computer").children("img").click();		
			$(`#window-firewall-part1`).click();
		}
		if ($("#window-bot").is(":visible") === false) {
			log("* Opening bot window");
			app.gui();
		}
		isAutomated = true;
		// start by getting the first target in the list
		const targetName = $("#player-list").children("tr").eq(playerToAttack)[0].innerText;
		log(`. Now attacking ${targetName}`);
		// click it, and then hack, and then port b
		$("#player-list").children("tr").eq(playerToAttack)[0].click();
		$("#window-other-button").click();
		// do a check for money
		let TargetFirewall = app.getFirewall()
		const portStyle = $(`#window-other-port${TargetFirewall}`).attr("style");
		if (portStyle.indexOf("opacity: 1") === -1) {
			// this port costs too much, let's wait a bit
			log("* Hack too expensive, waiting");
			setTimeout(app.automate, blockFreq);
			return;
		}
		$("#window-other-port"+TargetFirewall).click();
		// handle upgrades
		//app.loops.upgrade();
		
		
		wordFreq = app.getRandomArbitrary(wordFreqMin, wordFreqMax);
		// start the loop that does the guessing
		wordLoop = setInterval(app.loops.word, wordFreq);
		// start the loop for btc monitoring
		minerLoop = setInterval(app.loops.miner, mineFreq);
		// start the loop for upgrades
		upgradeLoop = setInterval(app.loops.upgrade, upgradeFreq);
	},
	
	getFirewall: ()=>{
		let select = app.getRandomArbitrary(0, firewalls.length-1)
		return firewalls[select]
	},

	getRandomArbitrary: (min, max)=>{
		return Math.round(Math.random() * (max - min) + min);
	},
	getFirewallToUpdate(){
		if(lastFirewallUpdated > firewalls.length-1)
			lastFirewallUpdated=0
			let firewall = firewalls[lastFirewallUpdated]
			lastFirewallUpdated++
		return firewall
	},
	gui: () => {
		 //check if bot window has been appended already
        if ($("#window-bot").length > 0) {
            $("#window-bot").show();
        }
        else {
            //Change windowWidth and windowHeight to change the bot's window size
            let windowWidth = "320px";
            let windowHeight = "350px";
            let botHTML = 
            "<div id='window-bot' class='window' style='" +
			"border-color:rgb(77, 100, 122);" + 
			"color:rgb(191, 207, 210);" +
			"height:" + windowHeight +
			";width:" + windowWidth +
			";z-index:10;" + 
			"top:363px;" + 
			"left:914px'>" +
                "<div id='bot-title' class='window-title' style='background-color: rgb(77, 100, 122)'>Source.io Bot" +
                    "<span class='window-close-style'>" +
                        "<img class='window-close-img' src='http://s0urce.io/client/img/icon-close.png'>" +
                    "</span>" +
                    "</div>" +
                    "<div class='window-content' style='width:" + windowWidth + ";height:"+windowHeight + "'>" + 
                        "<div id='restart-button' class='button' style='display: block; margin-bottom: 15px'>Restart Bot</div>" +
                        "<div id='stop-button' class='button' style='display: block; margin-bottom: 15px'>Stop Bot</div>" +
                        "<div id='start-button' class='button' style='display: block; margin-bottom: 15px'>Start Bot</div>" +
						"<span style='font-size:18px'>Hack speed Mini:" +
							"<input type='text' id='hack-speed-input-min' class='input-form' onkeypress='return event.charCode >= 48 && event.charCode <= 57' style='width:50px;margin:0px 0px 0px 2px' value=" + wordFreqMin +">"
						+"</span>"
						+"<br>"
						+"<span style='font-size:18px'>Hack speed Maxi:" +
						"<input type='text' id='hack-speed-input-max' class='input-form' onkeypress='return event.charCode >= 48 && event.charCode <= 57' style='width:50px;margin:0px 0px 0px 2px' value=" + wordFreqMax +">"
						+"</span>"+
                        "<div id='github-button' class='button' style='display: block; margin-top: 30%'>This script is on Github!</div>" +
                    "</div>" +
                "</div>" +
            "</div>";

            $(".window-wrapper").append(botHTML);

            //bind functions to the gui's buttons
            $("#bot-title > span.window-close-style").on("click", () => {
                $("#window-bot").hide();
            });

            $("#restart-button").on("click", () => {
                app.restart();
            });

            $("#stop-button").on("click", () => {
                app.stop();
            });

			$("#start-button").on("click", () => {
                app.automate();
            });

            $("#github-button").on("click", () => {
                window.open("https://github.com/bozoweed/Bot-s0urce.io")
            });
			
			$("#hack-speed-input-min").change(() => {
				setTimeout(()=>wordFreqMin = parseInt($("#hack-speed-input-min").val()), 1000)				
			});

			$("#hack-speed-input-max").change(() => {
				setTimeout(()=>wordFreqMax = parseInt($("#hack-speed-input-max").val()), 1000)	
			});
            //make the bot window draggable
            botWindow = ("#window-bot");

            $(document).on("mousedown", botWindow, (e) => {
                isDragReady = true;
                dragOffset.x = e.pageX - $(botWindow).position().left;
                dragOffset.y = e.pageY - $(botWindow).position().top;
            });

            $(document).on("mouseup", botWindow, (e) => {
                isDragReady = false;
            });

            $(document).on("mousemove", (e) => {
                if (isDragReady) {
                    $(botWindow).css("top", (e.pageY - dragOffset.y) + "px");
                    $(botWindow).css("left", (e.pageX - dragOffset.x) + "px");
                }
            });
        }
},
	loops: {
		word: () => {
			if (block === true) {
				return;
			}
			if ($("#targetmessage-input").is(":visible") === true) {
				// we're done!
				$("#targetmessage-input").val(message);
				$("#targetmessage-button-send").click();
				app.restart();
				return;
			}
			// if we're waiting on the progress bar to move...
			if (waiting === true) {
				const newHackProgress = parseHackProgress($("#progressbar-firewall-amount").attr("style"));
				// check to see if it's new
				if (hackProgress === newHackProgress) {
					// the bar hasn't moved
					app.restart();	//restart if not work
					return;
				} else {
					// the bar has moved
					hackProgress = newHackProgress;
					waiting = false;
				}
			}
			// actually do the word stuff
			waiting = true;
			app.go();
		},
		miner: () => {
			// first, get the status of our miners
			for (const miner of minerStatus) {
				// set value
				miner.value = parseInt($(`#${miner.name}-amount`).text());
				// this is available to buy
				if ($(`#${miner.name}`).attr("style") === "opacity: 1;") {
					if (miner.value < minerLevel) {
						// we should buy this
						$(`#${miner.name}`).click();
					}
				}
			}
		},
		upgrade: () => {
			// select the firewall
			const firewall = app.getFirewallToUpdate()
			log(`. Handling upgrades to firewall ${firewall}`);
			$(`#window-firewall-part`+firewall).click();

			myBT = parseInt($("#window-my-coinamount").text());
			// if the back button is visible, we're on a page, let's back out
			/*if ($("#window-firewall-pagebutton").is(":visible") === true) {
				$("#window-firewall-pagebutton").click();
			}*/
			// get stats
			const stats = {
				charge: parseInt($("#shop-max-charges").text()),
				strength: parseInt($("#shop-strength").text()),
				regen: parseInt($("#shop-regen").text()),
			};
			// start checking prices, start with strength
			if (stats.strength < maxStats.strength) {
				log(". Strength isn't maxed");
				const strengthPrice = parseInt($("#shop-firewall-difficulty-value").text());
				if (strengthPrice < myBT) {
					myBT-=strengthPrice
					log(". Buying strength");
					$("#shop-firewall-difficulty").click();
				}
			}			
			// check max charges
			if (stats.charge < maxStats.charge) {
				log(". Charge isn't maxed");
				const chargePrice = parseInt($("#shop-firewall-max_charge10-value").text());
				if (chargePrice < myBT) {
					myBT-=chargePrice
					$("#shop-firewall-max_charge10").click();
					log(". Buying charge");
				}
			}
			// check regen
			if (stats.regen < maxStats.regen) {
				log(". Regen isn't maxed");
				const regenPrice = parseInt($("#shop-firewall-regen-value").text());
				if (regenPrice < myBT) {
					myBT-=regenPrice
					$("#shop-firewall-regen").click();
					log(". Buying regen");
				}
			}
			// nothing matched, let's go back
			if ($("#window-firewall-pagebutton").is(":visible") === true) {
				$("#window-firewall-pagebutton").click();
			}
		},
	},

	restart: () => {
		app.stop();
		app.automate();
	},
	
	

	stop: () => {
		if (wordLoop === null && minerLoop === null && upgradeLoop === null && defLoop === null) {
			log("! No loops to stop");
			return;
		}
		isAutomated = false;
		block = false;
		waiting = false;
		clearInterval(wordLoop);
		wordLoop = null;
		clearInterval(minerLoop);
		minerLoop = null;
		clearInterval(upgradeLoop);
		upgradeLoop = null;
		log("* Stopped loops");
	},

	exportListing: () => {
		log(JSON.stringify(listing, null, 2));
	},

	go: () => {
		const wordLink = $(".tool-type-img").prop("src");
		if ( wordLink !== "http://s0urce.io/client/img/words/template.png" ) {
		if (wordLink !== "http://www.s0urce.io/client/img/words/template.png" ) {
			if (listing.hasOwnProperty(wordLink) === true) {
				const word = listing[wordLink];
				log(`. Found word: [${word}]`);
				log(`. Freq: [${wordFreq}]`);
				app.submit(word);
				return;
			}
			log(`. Found word: [${wordLink}]`);
			
			log(`.[${listing[wordLink]}]`);
			log("* Not seen, trying OCR...");
			app.ocr(wordLink);
		}
		else {
			log("* Can't find the word link...");
			app.restart();	
		}
		}
		else {
			log("* Can't find the word link...");
			app.restart();	
		}
	},

	submit: (word) => {
		$("#tool-type-word").val(word);
		$("#tool-type-word").submit();
	},

	learn: (word) => {
		const wordLink = $(".tool-type-img").prop("src");
		listing[wordLink] = word;
		app.submit(word);
	},

	ocr: (url) => {
		block = true;
		$.post("http://api.ocr.space/parse/image", {
			apikey: ocrApiKey,
			language: "eng",
			url: url
		}).done((data) => {
			const word = String(data["ParsedResults"][0]["ParsedText"]).trim().toLowerCase().split(" ").join("");
			if (word.length > 2) {
				log(`. Got data: [${word}]`);
				$("#tool-type-word").val(word);
				if (isAutomated === true) {
					app.learn(word);
					block = false;
				}
			} else {
				log("* OCR failed");
				app.restart();
			}
		});
	}
};




function parseHackProgress(progress) {
	// remove the %;
	const newProgress = progress.slice(0, -2);
	const newProgressParts = newProgress.split("width: ");
	return parseInt(newProgressParts.pop());
}

function log(message) {
	console.log(`:: ${message}`);
}
