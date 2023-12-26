function validateCreditCard(cardNumber) {
    // const cleanedCardNumber = cardNumber.replace(/\D/g, '');
    const isVisa = /^4[0-9]{12}(?:[0-9]{3})?$/.test(cardNumber);
    const isMasterCard = /^5[1-5][0-9]{14}$/.test(cardNumber);
    const isAmex = /^3[47][0-9]{13}$/.test(cardNumber);
    const isDiscover = /^6(?:011|5[0-9]{2})[0-9]{12}$/.test(cardNumber);
    const isDinersClub = /^3(?:0[0-5]|[68][0-9])?[0-9]{11}$/.test(cardNumber);
    if (isVisa) {
        return 'Visa';
    } else if (isMasterCard) {
        return 'MasterCard';
    } else if (isAmex) {
        return 'American Express';
    } else if (isDiscover) {
        return 'Discover';
    } else if (isDinersClub) {
        return 'Diners Club';
    } else {
        return 'Invalid card';
    }
}
module.exports = validateCreditCard;
