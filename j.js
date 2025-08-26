const searchInput = document.getElementById('searchInput');
const recipesContainer = document.getElementById('recipesContainer');
const clearBtn = document.getElementById('clearBtn');
const searchHistoryList = document.getElementById('searchHistory');

// load
window.addEventListener('DOMContentLoaded', async () => {
  const lastSearch = localStorage.getItem('lastSearch');
  const savedRecipes = localStorage.getItem('recipesData');
  const history = getSearchHistory();
  renderSearchHistory(history);

  if (lastSearch && savedRecipes) {
    searchInput.value = lastSearch;
    displayRecipes(JSON.parse(savedRecipes));
  } else {
    const defaultQuery = 'pizza';
    const recipes = await fetchRecipes(defaultQuery);
    displayRecipes(recipes);
    localStorage.setItem('recipesData', JSON.stringify(recipes));
  }
});

// enter btn
searchInput.addEventListener('keyup', async (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    const safeQuery = query.replace(/[^a-zA-Z0-9\s]/g, '');

    if (safeQuery.length < 3) {
      recipesContainer.innerHTML = '<p class="text-center text-muted">Please type at least 3 valid letters.</p>';
      return;
    }

    const recipes = await fetchRecipes(safeQuery);
    displayRecipes(recipes);

    localStorage.setItem('lastSearch', safeQuery);
    localStorage.setItem('recipesData', JSON.stringify(recipes));

    updateSearchHistory(safeQuery);
  }
});

// clear btn
clearBtn.addEventListener('click', async () => {
  searchInput.value = '';
  localStorage.removeItem('lastSearch');
  localStorage.removeItem('recipesData');
  localStorage.removeItem('searchHistory');
  renderSearchHistory([]);

  const defaultQuery = 'pizza';
  const recipes = await fetchRecipes(defaultQuery);
  displayRecipes(recipes);
  localStorage.setItem('recipesData', JSON.stringify(recipes));
});

// api error
async function fetchRecipes(query) {
  try {
    const res = await fetch(`https://forkify-api.herokuapp.com/api/search?q=${query}`);

    if (!res.ok) {
      if (res.status === 400) {
        console.warn(`API returned 400 for query: "${query}"`);
        return [];
      } else {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    }

    const data = await res.json();
    return data.recipes || [];
  } catch (err) {
    console.error('Error fetching recipes:', err);
    return [];
  }
}
function displayRecipes(recipes) {
  recipesContainer.innerHTML = '';

  if (recipes.length === 0) {
    recipesContainer.innerHTML = '<p class="text-center text-danger">No recipes found. Try another word body!</p>';
    return;
  }

  recipes.forEach(recipe => {
    const col = document.createElement('div');
    col.className = 'col-md-4';

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${recipe.image_url}" class="card-img-top" alt="${recipe.title}" style="height: 200px; object-fit: cover;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${recipe.title}</h5>
          <p class="card-text text-muted">Publisher: ${recipe.publisher}</p>
          <a href="${recipe.source_url}" target="_blank" class="btn btn-success mt-auto">View Recipe</a>
        </div>
      </div>
    `;
    recipesContainer.appendChild(col);
  });
}

// history
function getSearchHistory() {
  return JSON.parse(localStorage.getItem('searchHistory') || '[]');
}

function updateSearchHistory(query) {
  let history = getSearchHistory();

  history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
  history.unshift(query);
  if (history.length > 5) history.pop();

  localStorage.setItem('searchHistory', JSON.stringify(history));
  renderSearchHistory(history);
}

function renderSearchHistory(history) {
  searchHistoryList.innerHTML = '';

  history.forEach(item => {
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-action';
    li.textContent = item;

    li.addEventListener('click', async () => {
      searchInput.value = item;
      const recipes = await fetchRecipes(item);
      displayRecipes(recipes);
      localStorage.setItem('lastSearch', item);
      localStorage.setItem('recipesData', JSON.stringify(recipes));
    });

    searchHistoryList.appendChild(li);
  });
}
