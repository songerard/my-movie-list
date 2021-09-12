const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')
let currentPage = 1
let maxPage = 1
let filteredMovies = []

//////////////// axios get API data /////////////////////

axios
  .get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results)
    renderMovieList(getMoviesByPage(currentPage))
    renderPaginator(movies.length)
  })
  .catch(err => console.log(err))


//////////////// EventListener /////////////////////

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  console.log(keyword)
  if (!keyword.length) {
    return alert('請輸入有效字串')
  }

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword)) 
  if (!filteredMovies.length) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderMovieList(getMoviesByPage(1))
  renderPaginator(filteredMovies.length)
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  switch (event.target.id) {
    case 'btn-previous-page':
      currentPage = currentPage === 1? 1 : currentPage - 1
      renderMovieList(getMoviesByPage(currentPage))
      break
    case 'btn-next-page':
      currentPage = currentPage === maxPage? maxPage : currentPage + 1
      renderMovieList(getMoviesByPage(currentPage))
      break
    case '':
      currentPage = Number(event.target.dataset.page)
      renderMovieList(getMoviesByPage(currentPage))
      break
  }
})

//////////////// function /////////////////////

function renderMovieList(data) {
  if (!data.length) return dataPanel.innerHTML = ''
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src=${POSTER_URL + item.image}
              class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                  data-target="#movie-modal" data-id=${item.id}>More</button>
                <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
              </div>
              </div>
          </div>
        </div>
      </div>`
    dataPanel.innerHTML = rawHTML
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  
  if (list.some(listItem => listItem.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  

  axios
    .get(INDEX_URL + id)
    .then(response => {
      const movieDetails = response.data.results
      
      modalTitle.innerText = movieDetails.title
      modalImage.src = POSTER_URL + movieDetails.image
      modalDate.innerText = 'Release date: ' + movieDetails.release_date
      modalDescription.innerText = movieDetails.description
    })
}


function renderPaginator(amount) {
  maxPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  rawHTML += `
    <li class="page-item"><a class="page-link diabled" href="#" id="btn-previous-page">Previous</a></li>
    `
  for (let i = 1; i <= maxPage; i++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page=${i}>${i}</a></li>
    `
  }
  
  rawHTML += `
    <li class="page-item"><a class="page-link" href="#" id="btn-next-page">Next</a></li>
  `
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}