//rafce es un shorcout para crear un componente funcional en React

import { useState, useEffect } from 'react';
import './App.css'
import Search from './components/search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';

//Vamos a conectar la base de datos
const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState(' ');
  const [errorMessage, setErrorMessage] = useState(null);
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  //Vamos a implementar el dbeounce en la busqueda, basicamente es una tecnica que nos permite retrasar la ejecucion de una funcion hasta que el usuario haya dejado de escribir por un periodo de tiempo determinado, esto ayuda nuestra efienciea en el sentido que no hacemos una peticion a la API por cada letra que el usuario escribe, sino que esperamos a que termine de escribir y luego hacemos la peticion
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState();

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);


  //Fetch signifca que obtenemos datos de una API
  const fetchMovies = async (query = '') => {

    setIsLoading(true);
    setErrorMessage('');

    try{
      const endpoint = query
      ?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      
      if(!response.ok){
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      
      if(data.Response == "False"){
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

    }catch(error){
      console.error('Error fetching movies:', error);
      setErrorMessage('Failed to fetch movies. Please try again later.');
    }finally{
      setIsLoading(false); 
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm])


  return ( 
    <main>
      <div className="pattern"></div>

        <div className="wrapper">
          <header>
            <img src="./hero.png" alt="Hero Banner" />
            <h1>Find <span className='text-gradient'>Movies</span>You'll Enjoy Without the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header> 

          <section className="all-movies">
            <h2 className='mt-[40px]'>All Movies</h2> 

            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              //Cuando mapeamos informacion, siempre debemos poner el key para que React pueda identificar cada elemento de la lista
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
          </section>
          
        </div> 
    </main>

  )
}

export default App
