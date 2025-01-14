let numbers = [1, 2, 3, 4, 5]

let numbers2 = []

for (let index = numbers.length - 1; index >= 0; index--) {
    numbers2.push(numbers[index])
}

console.log(numbers2);