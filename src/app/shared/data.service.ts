import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { config } from '../config';
import { Observable, Subject } from 'rxjs';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class DataService {

  private url = config.apiUrl;
  public movies;
  public moviesStream =  new Subject();
  public localRatings;
  public localRatingStream =  new Subject();
  constructor(private http: Http) { }

  getData(target) {
    return this.http.get(this.url + target)
      .toPromise()
      .then(
        response => {
          this.movies = response.json();
          this.moviesStream.next(this.movies);
          return true;
        }
      )
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
  getMoviesStream() {
    return Observable
      .from(this.moviesStream)
      .startWith(this.movies);
  }

  getMovieRating(id: number) {
    return this.http.get(this.url + 'movies/' + id + '/ratings')
      .toPromise()
      .then(
        response => response.json()
      )
      .catch(this.handleError);
  }
  saveRating(id, vote) {
    this.saveRatingLocal(id, vote);
    return this.http.post(this.url + 'movies/' + id + '/ratings', {rating: vote})
      .toPromise()
      .then(
        response => response.json()
      )
      .catch(this.handleError);
  }
  getLocalRatingStream() {
    return Observable
      .from(this.localRatingStream)
      .startWith(this.localRatings);
  }
  saveRatingLocal(id, vote) {
    let localRating: any = localStorage.getItem('movies');
    localRating = JSON.parse(localRating);
    if (localRating) {
      localRating[id] = vote;
    }else {
      localRating = {};
      localRating[id] = vote;
    }
    localStorage.setItem('movies', JSON.stringify(localRating));
    this.localRatings = localRating;
    this.localRatingStream.next(this.localRatings);
  }
  getRatingLocal() {
    this.localRatings =  JSON.parse(localStorage.getItem('movies'));
    this.localRatingStream.next(this.localRatings);
  }
}
