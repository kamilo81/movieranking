import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../shared/data.service';
import { DatatableComponent } from '@swimlane/ngx-datatable/src/components/datatable.component';
import { Router,
  ActivatedRoute,
  NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  movies;
  temp;
  count: number;
  query: string;
  localRatings;
  table: DatatableComponent;
  selectedMovie;
  subMovies: Subscription;
  subRoute: Subscription;
  subParam: Subscription;
  subLocalRatings: Subscription;
  constructor(
    private ds: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.ds.getRatingLocal();
    this.subLocalRatings = this.ds.getLocalRatingStream().subscribe(data => {
      this.localRatings = data;
    });
    this.subMovies = this.ds.getMoviesStream().subscribe(movies => {
      if (movies) {
        setTimeout( () => {
          this.movies = movies;
          this.temp = this.movies;
          this.updateFilter(this.query);
        });
      } else {
        this.ds.getData('movies').then(data => {
        }, err => {
          console.log(err);
        });
      }
    });

    this.subRoute = this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (val.url === '/') {
          this.selectedMovie = false;
        }
        if (this.route.firstChild) {
          this.subParam = this.route.firstChild.params.subscribe(params => {
            this.selectedMovie = params['id'];
          });
        }
      }
    });
  }
  ngOnDestroy() {
    this.subMovies.unsubscribe();
    this.subRoute.unsubscribe();
    this.subLocalRatings.unsubscribe();
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
  }
  filter(toFilter, query) {
    const isSearch = (data: any): boolean => {
      let isAll = false;
      if (typeof data === 'object' ) {
        for (const z in data) {
          if (isAll = isSearch(data[z]) ) {
            break;
          }
        }
      } else {
        if (typeof query === 'number') {
          isAll = data === query;
        } else {
          isAll = data.toString().match( new RegExp(query, 'i') );
        }
      }
      return isAll;
    };
    return toFilter.filter(isSearch);
  }


  updateFilter(event) {
    const temp = this.filter(this.temp, event);
    this.count = temp.length;
    this.movies = temp;
    if (this.table) {
      this.table.offset = 0;
    }
  }

  onActivate(event) {
    this.router.navigate([event.row.id]);

  }

  close() {
    this.selectedMovie = null;
    this.router.navigate(['']);
  }
}
