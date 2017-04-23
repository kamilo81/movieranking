import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit, OnDestroy {
  subParam: Subscription;
  subMovies: Subscription;
  subLocalRatings: Subscription;
  id: number;
  error;
  rating;
  movie;
  currentVote = 0;
  availableVotes = [5, 4, 3, 2, 1];
  voteSuccess = 0;
  voting = false;
  constructor(
    private route: ActivatedRoute,
    private ds: DataService
  ) { }

  ngOnInit() {
    this.subParam = this.route.params.subscribe(params => {
      this.error = null;
      this.id = parseInt(params['id'], 10);

      this.subLocalRatings = this.ds.getLocalRatingStream().subscribe(data => {
        if (data) {
          this.currentVote = data[this.id];
        }
      });

      this.ds.getMovieRating(this.id).then(data => {
        this.subMovies = this.ds.getMoviesStream().subscribe(movies => {
          this.movie = movies.find(arr => {
            if (arr.id === this.id) {
              return arr;
            }
          });
        });
        this.countRating(data);

      }, err => {
        console.log(err);
        this.error = err;
      });
    });
  }
  ngOnDestroy() {
    this.subParam.unsubscribe();
    if (this.subMovies) {
      this.subMovies.unsubscribe();
    }
    this.subLocalRatings.unsubscribe();
  }
  vote(v: number) {
    if (this.voting) {
      return;
    }
    this.voteSuccess = 0;
    this.voting = true;
    this.ds.saveRating(this.id, v).then(() => {
      this.currentVote = v;
      this.voteSuccess = 1;
      this.voting = false;

      this.ds.getMovieRating(this.id).then(data => {
        this.countRating(data);
      }, err => {
        console.log(err);
        this.error = err;
      });
    }, err => {
      this.voteSuccess = 2;
      this.voting = false;
      console.log(err);
    });
  }
  countRating(data) {
    const sum = data.reduce(this.getSum).rating;
    this.rating = (sum / data.length ).toFixed(1);
  }
  getSum(total, num) {
    return {rating: num.rating + total.rating};
  }
}
