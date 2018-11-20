import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { IconModule } from '../../../icon.module';
import { User } from '../../../models/user/user.model';

import { LoginStatusComponent } from './login-status.component';

describe('Login Status Component', () => {
  let fixture: ComponentFixture<LoginStatusComponent>;
  let component: LoginStatusComponent;
  let element: HTMLElement;

  const userData = {
    type: 'PrivateCustomer',
    firstName: 'Patricia',
    lastName: 'Miller',
  } as User;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [IconModule, TranslateModule.forRoot()],
      declarations: [LoginStatusComponent],
      providers: [],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(LoginStatusComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;
      });
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should render full name on template when user is logged in', () => {
    component.user = userData;

    fixture.detectChanges();

    const loggedInDetails = element.getElementsByClassName('login-name');
    expect(loggedInDetails).toBeTruthy();
    expect(loggedInDetails.length).toBeGreaterThan(0);
    expect(loggedInDetails[0].textContent).toEqual('Patricia Miller');
  });

  it('should render nothing on template when user is not logged in', () => {
    fixture.detectChanges();

    const loggedInDetails = element.getElementsByClassName('login-name');
    expect(loggedInDetails).toHaveLength(0);
  });
});
