import { Component, signal } from '@angular/core';
import { validateContact } from '../../../shared/catalog-utils.mjs';

@Component({
  standalone: true,
  template: `
    <main class="page-shell"><h1>Contact us</h1><p class="page-intro">Send a note to the catalog team.</p>
      <form class="contact-form" novalidate (submit)="submit($event)">
        <div class="field"><label for="contact-name">Name</label><input id="contact-name" data-testid="contact-name" name="name" [value]="name()" (input)="name.set(valueFrom($event))" />@if (errors()['name']) {<span class="error" data-testid="field-error">{{ errors()['name'] }}</span>}</div>
        <div class="field"><label for="contact-email">Email</label><input id="contact-email" data-testid="contact-email" name="email" type="email" [value]="email()" (input)="email.set(valueFrom($event))" />@if (errors()['email']) {<span class="error" data-testid="field-error">{{ errors()['email'] }}</span>}</div>
        <div class="field"><label for="contact-message">Message</label><textarea id="contact-message" data-testid="contact-message" name="message" [value]="message()" (input)="message.set(valueFrom($event))"></textarea>@if (errors()['message']) {<span class="error" data-testid="field-error">{{ errors()['message'] }}</span>}</div>
        <button class="button" data-testid="contact-submit" type="submit">Send message</button>
        @if (success()) {<p class="success" data-testid="form-success" role="status">Message sent. Thank you!</p>}
      </form>
    </main>
  `,
})
export class ContactPageComponent {
  readonly name = signal('');
  readonly email = signal('');
  readonly message = signal('');
  readonly errors = signal<Record<string, string>>({});
  readonly success = signal(false);

  valueFrom(event: Event) {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  submit(event: Event) {
    event.preventDefault();
    const errors = validateContact({ name: this.name(), email: this.email(), message: this.message() });
    this.errors.set(errors);
    this.success.set(Object.keys(errors).length === 0);
  }
}
