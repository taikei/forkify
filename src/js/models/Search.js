//const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);
import axios from 'axios';


export default class Search {
    constructor(query){
        this.query = query;
    }

    async getResults(query){
        //No API key required
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/search?q=${this.query}`);
            this.result = res.data.recipes;
            //console.log(this.result);
        } catch(error){
            console.log(error)
        }
        
    }

}




//Search URL
//https://forkify-api.herokuapp.com/api/search

//GET
//https://forkify-api.herokuapp.com/api/get


//Recipe.js
//const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
