// Global app controller

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

import { elements, renderLoader, clearLoader } from './views/base';



//Global state of the app
// - Search object
// - Current recipe object
// - Shopping list object
// - Linked recipes

const state = {};

// SERACH CONTROLLER
const controlSearch = async () => {
    // 1) Get the query from view
    const query = searchView.getInput();
 
    if (query) {
        // 2) New Search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        
        try {
            // 4) Search for recipes
            await state.search.getResults();

            // 5) Render resuults on UI
            clearLoader();
            searchView.renderResults(state.search.result);

        } catch (error) {
            console.log('Something went wrong with the search...');
        }
        


    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});






elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        console.log(goToPage)
    }
});


/**
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {
    //Get the id from URL
    const id = window.location.hash.replace('#', '');
   

    if (id) {

        //prepare the UI for change
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        if(state.search) searchView.highlightSelected(id);

        //create new recipe object
        state.recipe = new Recipe(id);

      



        try {
            //get recipe data and parse the ingredients
            await state.recipe.getRecipe();
            //console.log(state.recipe.ingredients);
            state.recipe.parseIngredients();
            //calculate servings and cookking time
            
            state.recipe.calcTime();
            state.recipe.calcServings();

            //render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );
        } catch (error) {
            console.log(error)
            alert('Error processing recipe');
        } 
        
    }
}

 window.addEventListener('hashchange', controlRecipe);
 window.addEventListener('load', controlRecipe);



//LIST CONTROLLER


const controlList = () => {
    // create a new list if there in none yet
    if (!state.list) state.list = new List();

    //add each ingredients
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
}





//Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete item
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        //delete from UI
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }
});



//like Controller



const controlLike = () => {
    if(!state.likes) state.likes = new Likes();

    const currentID = state.recipe.id;
    //User has not liked current recipe
    if(!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        //Toggel the like Button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);


    // User has liked the current recipe
    } else {
        //Remove like from the state
        state.likes.deleteLike(currentID);
        //Toggle the like button
        likesView.toggleLikeBtn(false);
        //Remove like from UI list
        likesView.deleteLike(currentID);

    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked Recipe on page load

window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach( like => likesView.renderLike(like));
    
})



 //Handling Recipe button clicks
 elements.recipe.addEventListener('click', e => {
     if (e.target.matches('.btn-decrease, .btn-decrease *')) {
         // Decrease
         if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
         }
     } else if (e.target.matches('.btn-increase, .btn-increase *')) {
         // Increase
         state.recipe.updateServings('inc');
         recipeView.updateServingsIngredients(state.recipe);
     } else if (e.target.matches('.recipe__btn-add, .recipe__btn-add *')) {
         // add ingredients to shopping list
         controlList();
     } else if (e.target.matches('.recipe__love, .recipe__love *')) {
         // LIke Controller
         controlLike();
     }
     //console.log(state.recipe);
 });


