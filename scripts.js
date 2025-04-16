/**
 * Data Catalog Project Starter Code - SEA Stage 2
 *
 * This file is where you should be doing most of your work. You should
 * also make changes to the HTML and CSS files, but we want you to prioritize
 * demonstrating your understanding of data structures, and you'll do that
 * with the JavaScript code you write in this file.
 *
 * The comments in this file are only to help you learn how the starter code
 * works. The instructions for the project are in the README. That said, here
 * are the three things you should do first to learn about the starter code:
 * - 1 - Change something small in index.html or style.css, then reload your
 *    browser and make sure you can see that change.
 * - 2 - On your browser, right click anywhere on the page and select
 *    "Inspect" to open the browser developer tools. Then, go to the "console"
 *    tab in the new window that opened up. This console is where you will see
 *    JavaScript errors and logs, which is extremely helpful for debugging.
 *    (These instructions assume you're using Chrome, opening developer tools
 *    may be different on other browsers. We suggest using Chrome.)
 * - 3 - Add another string to the titles array a few lines down. Reload your
 *    browser and observe what happens. You should see a fourth "card" appear
 *    with the string you added to the array, but a broken image.
 *
 */


// Your final submission should have much more data than this, and
// you should use more than just an array of strings to store it all.

let lastUsedSort = [];
let includedCategories = [];
let excludedCategories = [];

// stores and sorts index to sort by views (default) 
let viewsIndexSort = [];
function viewsSort() {
  viewsIndexSort = []
  for (let i = 0; i < wikipediaData.length; i++) {
    viewsIndexSort.push(i)
  }
  console.log('finished viewsort')
  showCards(viewsIndexSort)
  lastUsedSort = viewsIndexSort
}

// stores and sorts index to sort by alphabet 
let alphaIndexSort = []

function alphaSort() {
  alphaIndexSort = []
  let titleList = [];
  for (let i = 0; i < wikipediaData.length; i++) {
    titleList.push(wikipediaData[i]["title"])
  }
  titleList.sort()

  for (let i = 0; i < wikipediaData.length; i++) {
    for (let j = 0; j < titleList.length; j++) {
      if (wikipediaData[i]["title"]==titleList[j]) {
        alphaIndexSort.push(j);
        continue;
      }
    }
  } 
  console.log('finished lphsort')
  showCards(alphaIndexSort)
  lastUsedSort = alphaIndexSort
}

// randomly stores and sorts index
let randIndexSort = []
function randomSort() {
  randIndexSort = []
  for (let i = 0; i < wikipediaData.length; i++) {
    randIndexSort.push(i)
  }

  let currentIndex = randIndexSort.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [randIndexSort[currentIndex], randIndexSort[randomIndex]] = [
      randIndexSort[randomIndex], randIndexSort[currentIndex]];
  }
  showCards(randIndexSort)
  lastUsedSort = randIndexSort
}

function validateCategories(newCategoryList) {
  if (includedCategories.length==0&&excludedCategories.length==0) {
    console.log("cats empty");
    return false
  }
  for (let i = 0; i < newCategoryList.length; i++) {
    if (excludedCategories.includes(newCategoryList[i])) {
      return true;
    }
  }
  for (let i = 0; i < newCategoryList.length; i++) {
    if (includedCategories.includes(newCategoryList[i])) {
      return false;
    }
  }
  if (includedCategories.length==0) {
    return false
  }
  //has no excluded cat and no wanted cat
  console.log("All else fails");
  return true
}
// This function adds cards the page to display the data in the array
function showCards(sortType) {
  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = "";
  const templateCard = document.querySelector(".card");

  for (let i = 0; i < wikipediaData.length; i++) {
    let title = wikipediaData[i]["title"];
    let imageURL = wikipediaData[i]["image"];
    let link = wikipediaData[i]["link"];
    let categoryList = wikipediaData[i]["categories"];
    let extract = wikipediaData[i]["extract"];
    let views = wikipediaData[i]["views"];
    let description = wikipediaData[i]["description"];
    let sortIndex = sortType[i];

    if (validateCategories(categoryList)) {
      console.log("Excluded", title)
      continue
    }

    const nextCard = templateCard.cloneNode(true); // Copy the template card
    editCardContent(nextCard, title, description, extract, link, views, imageURL, categoryList, sortIndex); // Edit title and image
    cardContainer.appendChild(nextCard); // Add new card to the container
  }
  console.log("showCards finish")
}

function editCardContent(card, newTitle, newDescription, newExtract, newLink, newViews, newImageURL, newCategoryList, newSortIndex) {
  card.style.display = "block";

  const cardHeader = card.querySelector("h2");
  cardHeader.textContent = newTitle;
  const cardDescription = card.querySelector("h3");
  cardDescription.textContent = newDescription;

  // add extract
  const cardExtract = card.querySelector(".extract");
  cardExtract.innerHTML = newExtract;
  const cardLink = card.querySelector("a");
  cardLink.href = newLink;

  // add views
  const cardViews = card.querySelector(".viewsNumber");
  cardViews.textContent = newViews;

  // add categories to list
  const catContainer = card.querySelector("ul");
  for (let i = 0; i < newCategoryList.length; i++) {
    var catLi = document.createElement('li');
    catLi.appendChild(document.createTextNode(newCategoryList[i]));
    catContainer.appendChild(catLi)
  }

  const cardImage = card.querySelector("img");
  cardImage.src = newImageURL;
  cardImage.alt = newTitle + " Image";

  card.style.order = newSortIndex

  // You can use console.log to help you debug!
  // View the output by right clicking on your website,
  // select "Inspect", then click on the "Console" tab
  //console.log("new card:", newTitle, "- html: ", card);
}


//document.addEventListener("DOMContentLoaded", viewsSort);
//document.addEventListener("DOMContentLoaded", alphaSort);
// This calls the addCards() function when the page is first loaded
//document.addEventListener("DOMContentLoaded", showCards(viewsIndexSort));
document.addEventListener("DOMContentLoaded",viewsSort)

function populateCategoriesOptions() {
  categoriesList = []
  for (let i = 0; i < wikipediaData.length; i++) {
    for (let j = 0; j < wikipediaData[i]["categories"].length; j++) {
      categoryName = wikipediaData[i]["categories"][j]
      if (!categoriesList.includes(categoryName)) {
        categoriesList.push(categoryName)
      }
    }
  }

  const categoryFilterLists = document.querySelectorAll("select")
  categoriesList.sort((a, b) => a.localeCompare(b));

  console.log(categoriesList)
  for (let i = 0; i < categoryFilterLists.length; i++) {
    categoryFilter = categoryFilterLists[i]
    for (let j = 0; j < categoriesList.length; j++) {
      let categoryName = categoriesList[j]
      var catOption = document.createElement('option');
      catOption.value = categoryName
      catOption.innerHTML = categoryName
      categoryFilter.appendChild(catOption)
    }
  }
} 

document.addEventListener("DOMContentLoaded",populateCategoriesOptions)

function getCategories() {

  includedCategories = Array.from(document.getElementById('includedCategories').selectedOptions).map(option => option.value);
  excludedCategories = Array.from(document.getElementById('excludedCategories').selectedOptions).map(option => option.value);

  console.log('Included Categories:', includedCategories);
  console.log('Excluded Categories:', excludedCategories);

  showCards(lastUsedSort);
}