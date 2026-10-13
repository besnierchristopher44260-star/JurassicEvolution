import { ExponentialCost, FirstFreeCost, LinearCost } from "./api/Costs";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";
import { Localization } from "./api/Localization";

var id = "jurassic_evolution_v1";
var name = "Jurassic Evolution";
var description = "Fais eclore des dinosaures, nourris ton parc et accelere leur evolution genetique. Une theorie originale inspiree de Jurassic Park.";
var authors = "ChatGPT (pour un joueur d'Exponential Idle)";
var version = 1;

var currency, eggs, food, genes, habitats, dnaMilestone, parkMilestone;

var eggValue = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var foodValue = (level) => BigNumber.TWO.pow(level);
var genesValue = (level) => BigNumber.TWO.pow(level);
var habitatValue = (level) => BigNumber.from(1 + level);

var init = () => {
    currency = theory.createCurrency();

    eggs = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(10, Math.log2(1.8))));
    eggs.getDescription = (_) => Utils.getMath("E=" + eggValue(eggs.level).toString(0));
    eggs.getInfo = (amount) => Utils.getMathTo("E=" + eggValue(eggs.level).toString(0), "E=" + eggValue(eggs.level + amount).toString(0));

    food = theory.createUpgrade(1, currency, new ExponentialCost(25, Math.log2(2.6)));
    food.getDescription = (_) => Utils.getMath("F=2^{" + food.level + "}");
    food.getInfo = (amount) => Utils.getMathTo("F=" + foodValue(food.level).toString(0), "F=" + foodValue(food.level + amount).toString(0));

    genes = theory.createUpgrade(2, currency, new ExponentialCost(1e4, Math.log2(3.5)));
    genes.getDescription = (_) => Utils.getMath("G=2^{" + genes.level + "}");
    genes.getInfo = (amount) => Utils.getMathTo("G=" + genesValue(genes.level).toString(0), "G=" + genesValue(genes.level + amount).toString(0));

    habitats = theory.createUpgrade(3, currency, new ExponentialCost(1e7, Math.log2(5)));
    habitats.getDescription = (_) => Utils.getMath("H=1+" + habitats.level);
    habitats.getInfo = (amount) => Utils.getMathTo("H=" + habitatValue(habitats.level).toString(0), "H=" + habitatValue(habitats.level + amount).toString(0));

    theory.createPublicationUpgrade(0, currency, 1e9);
    theory.createBuyAllUpgrade(1, currency, 1e12);
    theory.createAutoBuyerUpgrade(2, currency, 1e25);

    theory.setMilestoneCost(new LinearCost(20, 25));
    dnaMilestone = theory.createMilestoneUpgrade(0, 3);
    dnaMilestone.description = "Ameliorer l'ADN : exposant de G +0,1";
    dnaMilestone.info = "Augmente l'exposant du bonus genetique";
    dnaMilestone.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();

    parkMilestone = theory.createMilestoneUpgrade(1, 2);
    parkMilestone.description = "Etendre le parc : exposant de H +0,25";
    parkMilestone.info = "Augmente le rendement des habitats";
    parkMilestone.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();

    theory.createAchievement(0, "Premiere eclosion", "Obtenir un premier dinosaure.", () => eggs.level >= 1);
    theory.createAchievement(1, "Geneticien", "Debloquer les mutations genetiques.", () => genes.level >= 1);
    theory.createAchievement(2, "Jurassic World", "Construire cinq niveaux d'habitats.", () => habitats.level >= 5);
    theory.createStoryChapter(0, "Le premier oeuf", "La porte du laboratoire s'ouvre. Votre premier dinosaure est pret a eclore.", () => eggs.level >= 1);
    theory.createStoryChapter(1, "Le parc prend vie", "Le parc s'agrandit. L'ADN et la nourriture permettent d'accueillir de nouvelles especes.", () => habitats.level >= 1);
};

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let production = eggValue(eggs.level)
        * foodValue(food.level)
        * genesValue(genes.level).pow(1 + 0.1 * dnaMilestone.level)
        * habitatValue(habitats.level).pow(1 + 0.25 * parkMilestone.level);
    currency.value += dt * theory.publicationMultiplier * production;
};

var getPrimaryEquation = () => "\\dot{\\rho}=E\\cdot F\\cdot G^{" + (1 + 0.1 * dnaMilestone.level).toFixed(2) + "}\\cdot H^{" + (1 + 0.25 * parkMilestone.level).toFixed(2) + "}";
var getSecondaryEquation = () => "\\text{Jurassic Evolution}\\qquad \\tau=\\max\\rho";
var getPublicationMultiplier = (tau) => tau.pow(0.16) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{" + symbol + "^{0.16}}{3}";
var getTau = () => currency.value;
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

init();
