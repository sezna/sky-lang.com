
// for the compile button's functionality
document
  .getElementById("compile")
  .addEventListener("click", compileCodeAndUpdateDOM);

// for setting the code to examples
document
  .getElementById("twinkle")
  .addEventListener("click", () => setCode("twinkle"))

