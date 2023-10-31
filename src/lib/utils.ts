export function getRandomElements(arr: any[], count: number): any[] {
  // Copy the original array to prevent mutating it
  let tempArr = [...arr];

  let result = [];
  for (let i = 0; i < count; i++) {
    // If the array is empty, break the loop early
    if (tempArr.length === 0) break;

    // Choose a random index
    let randomIndex = Math.floor(Math.random() * tempArr.length);

    // Remove the element at the random index from the array and push it to the result
    result.push(tempArr.splice(randomIndex, 1)[0]);
  }

  return result;
}
