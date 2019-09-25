export default {
    hash: function (length: number = 10): String {
        let characters = "0123456789abcdef";
        let string = "";
        for(let i = 0; i < length; i++) {
            string += characters[Math.floor(Math.random() * characters.length)];
        }
        return string;
    },
    round: function(num: number, p: number): Number {
        return Math.round(num * (10 ** p)) / (10 ** p);
    },
    profileModes: ["STD", "Taiko", "Catch", "Mania"]
};