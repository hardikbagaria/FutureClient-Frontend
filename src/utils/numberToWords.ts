/**
 * Converts a number to Indian-style words (e.g. 4720 → "Four Thousand Seven Hundred and Twenty")
 */

const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
    'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertBelow100(n: number): string {
    if (n < 20) return ones[n];
    const ten = Math.floor(n / 10);
    const one = n % 10;
    return tens[ten] + (one ? ' ' + ones[one] : '');
}

function convertBelow1000(n: number): string {
    if (n < 100) return convertBelow100(n);
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return ones[hundred] + ' Hundred' + (rest ? ' and ' + convertBelow100(rest) : '');
}

function numberToWords(amount: number): string {
    if (amount === 0) return 'Zero';

    // Handle decimals: separate rupees and paise
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    const rupees = Math.floor(absAmount);
    const paiseRaw = Math.round((absAmount - rupees) * 100);

    let result = '';

    if (rupees === 0) {
        result = 'Zero';
    } else {
        const crore = Math.floor(rupees / 10000000);
        const lakh = Math.floor((rupees % 10000000) / 100000);
        const thousand = Math.floor((rupees % 100000) / 1000);
        const rest = rupees % 1000;

        const parts: string[] = [];
        if (crore) parts.push(convertBelow1000(crore) + ' Crore');
        if (lakh) parts.push(convertBelow1000(lakh) + ' Lakh');
        if (thousand) parts.push(convertBelow1000(thousand) + ' Thousand');
        if (rest) parts.push(convertBelow1000(rest));

        result = parts.join(' ');
    }

    if (paiseRaw > 0) {
        result += ' and ' + convertBelow100(paiseRaw) + ' Paise';
    }

    return (isNegative ? 'Minus ' : '') + result + ' Only';
}

export default numberToWords;
