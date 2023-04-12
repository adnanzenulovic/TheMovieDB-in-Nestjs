const form = document.getElementById('search-form');
const searchTerm = document.getElementById('query');
const root = document.getElementById('root');
const searchBar = document.getElementById('main-search');
const filterButton = document.getElementById('filter-button');
const genreFilter = document.getElementById('genreFilter');
const ratingFilter = document.getElementById('ratingFilter');
const yearFilter = document.getElementById('yearFilter');
const typeFilter = document.getElementById('typeFilter');
const orderByFilter = document.getElementById('orderByFilter');
const searchButton = document.getElementById('searchButton');
const logoutButton = document.getElementById('logout-button');

const DOMAIN = window.location.origin;
let searchOpenClose = false;
let page = 1,
  inSearchPage = false;

async function fetchData(URL) {
  try {
    // let data = await fetch(URL).then((res) => res.json());
    let data = await fetch(URL, {
      method: 'GET',
      headers: { Authorization: `Bearer ${Cookies.get('token')}` },
    });
    data = await data.json();
    return data;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

const fetchAndShowResults = async (URL) => {
  const data = await fetchData(URL);
  data && showResults(data);
};

const getSpecificPage = (URL) => {
  fetchAndShowResults(URL);
};

function searchData() {
  let search = {};
  if (searchTerm.value) search.title = searchTerm.value;
  if (genreFilter.value) search.genres = genreFilter.value;
  if (yearFilter.value) search.year = Number(yearFilter.value);
  if (ratingFilter.value) search.rating = Number(ratingFilter.value);
  if (typeFilter.value) search.type = typeFilter.value;
  if (orderByFilter.value) search.order = orderByFilter.value;
  return search;
}

const movieCard = (movie) =>
  `<div class="col">
          <div class="card">
            <a class="card-media" >
              <img src="${movie.poster}"  width="100%" />
            </a>

            <div class="card-content">
              <div class="card-cont-header">
                <div class="cont-left">
                  <h3 style="font-weight: 600">${movie.title}</h3>
                  <span style="color: #12efec">${movie.released}</span>
                </div>
                <div class="cont-right">
                  <a href="${movie.poster}" target="_blank" class="btn">See image</a>
                </div>
              </div>

              <div class="describe">
                ${movie.overview}
              </div>
            </div>
          </div>
        </div>`;

const showResults = (items) => {
  let content = !inSearchPage ? root.innerHTML : '';
  if (items && items.length > 0) {
    items.map((item) => {
      let { poster, title, released } = item;
      let overview = item.plot;

      if (title.length > 15) {
        title = title.slice(0, 15) + '...';
      }

      if (!overview) {
        overview = 'No overview yet...';
      }

      if (released) {
        let time = new Date(released);
        time = time.toLocaleString('en-GB', { timeZone: 'UTC' });
        time = time.slice(0, time.indexOf(' ') - 1);
        released = time;
      } else {
        released = 'No release date';
      }

      const movieItem = {
        poster,
        title,
        released,
        overview,
      };

      content += movieCard(movieItem);
    });
  } else {
    content += '<p>Something went wrong!</p>';
  }

  root.innerHTML = content; // Inject content to root
};

const handleLoadMore = () => {
  const URL = window.location.href + 'movies' + `/${++page}`;
  getSpecificPage(URL);
};

const detectEndAndLoadMore = () => {
  if (
    window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight &&
    !inSearchPage
  ) {
    handleLoadMore();
  }
};
searchButton.addEventListener('click', searchInput);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function searchInput() {
  inSearchPage = true;
  let filterInput = searchData();

  let response = await fetch(DOMAIN + '/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Cookies.get('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filterInput),
  });
  response = await response.json();
  response && showResults(response);
}

async function filterData(URL) {
  try {
    // let data = await fetch(URL).then((res) => res.json());
    let data = await fetch(URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
    });
    data = await data.json();
    const { genres, years } = data[0];
    genres.sort();
    years.sort(function (a, b) {
      return b - a;
    });
    for (let i of genres) {
      var item = document.createElement('option');
      item.text = i;
      item.value = i;
      genreFilter.options.add(item);
    }
    for (let i of years) {
      var item = document.createElement('option');
      item.text = i;
      item.value = i;
      yearFilter.options.add(item);
    }
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

window.addEventListener('scroll', detectEndAndLoadMore);

function init() {
  inSearchPage = false;
  filterData(DOMAIN + '/getFilterData');
  const URL = DOMAIN + `/movies/${page}`;
  fetchAndShowResults(URL);
}

init();

logoutButton.addEventListener('click', logout);

async function logout() {
  let response = await fetch(DOMAIN + '/auth/logout', {
    method: 'POST',
  });
  response = await response.json();
  if (response) location.reload();
  // console.log(response);
}
