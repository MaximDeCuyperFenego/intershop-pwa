import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, forwardRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Observable, ReplaySubject } from 'rxjs';
import { first, map, shareReplay, startWith, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { OrganizationManagementFacade } from '../../facades/organization-management.facade';

@Component({
  selector: 'ish-user-roles-selection',
  templateUrl: './user-roles-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => UserRolesSelectionComponent),
    },
  ],
})
export class UserRolesSelectionComponent implements ControlValueAccessor, OnInit {
  @Input() staticRoles: string[];

  form$: Observable<FormGroup>;

  private onTouched: Function;
  private staticRoles$ = new ReplaySubject<string[]>(1);
  private destroyRef = inject(DestroyRef);

  isExpanded: boolean[] = [];

  constructor(private fb: FormBuilder, private organizationManagementFacade: OrganizationManagementFacade) {}

  ngOnInit() {
    this.calculateStaticRoles();

    this.form$ = this.organizationManagementFacade.availableRoles$.pipe(
      withLatestFrom(this.staticRoles$),
      map(([roles, staticRoles]) =>
        this.fb.group(
          roles.reduce(
            (acc, role) => ({
              ...acc,
              [role.id]: this.createFormControl(
                staticRoles.includes(role.id),
                ['APP_B2B_OCI_USER', 'APP_B2B_CXML_USER'].includes(role.id)
              ),
            }),
            {}
          )
        )
      ),
      shareReplay(1)
    );
  }

  private createFormControl(isStatic: boolean, disable: boolean) {
    const control = new FormControl(isStatic);
    if (isStatic || disable) {
      control.disable();
    }
    this.isExpanded.push(false);
    return control;
  }

  private calculateStaticRoles() {
    this.organizationManagementFacade.availableRoles$
      .pipe(
        take(1),
        map(roles => roles.filter(r => r.fixed).map(r => r.id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(roles => {
        this.staticRoles$.next(this.staticRoles ? roles.concat(this.staticRoles) : roles);
      });
  }

  role$(id: string) {
    return this.organizationManagementFacade.role$(id);
  }

  get unsorted() {
    return () => 0;
  }

  hideRole(control: AbstractControl): boolean {
    return control.disabled && !control.value;
  }

  writeValue(initialRoleIDs: string[]): void {
    if (initialRoleIDs?.length) {
      this.form$.pipe(first(), takeUntilDestroyed(this.destroyRef)).subscribe(form => {
        initialRoleIDs
          .filter(id => form.get(id))
          .forEach(id => {
            form.get(id).setValue(true);
          });
      });
    }
  }

  private modelToRoles(values: { [id: string]: boolean }, staticRoles: string[]): string[] {
    return Object.entries(values)
      .filter(([, value]) => !!value)
      .map(([key]) => key)
      .concat(staticRoles);
  }

  registerOnChange(fn: (roles: string[]) => void): void {
    this.form$
      .pipe(
        switchMap(form => form.valueChanges.pipe(startWith(form.value))),
        withLatestFrom(this.staticRoles$),
        map(([value, staticRoles]) => this.modelToRoles(value, staticRoles)),
        tap(() => {
          if (this.onTouched) {
            this.onTouched();
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(fn);
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  toggleExpanded(index: number) {
    this.isExpanded[index] = !this.isExpanded[index];
  }
}
