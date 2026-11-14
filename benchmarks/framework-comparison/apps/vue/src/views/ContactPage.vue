<script setup lang="ts">
import { reactive, ref } from 'vue';
import { validateContact } from '../../../../shared/catalog-utils.mjs';

const values = reactive({ name: '', email: '', message: '' });
const errors = ref<Record<string, string>>({});
const success = ref(false);
function submit() {
  errors.value = validateContact(values);
  success.value = Object.keys(errors.value).length === 0;
}
</script>

<template>
  <main class="page-shell"><h1>Contact us</h1><p class="page-intro">Send a note to the catalog team.</p>
    <form class="contact-form" novalidate @submit.prevent="submit">
      <div class="field"><label for="contact-name">Name</label><input id="contact-name" v-model="values.name" data-testid="contact-name" name="name" /><span v-if="errors.name" class="error" data-testid="field-error">{{ errors.name }}</span></div>
      <div class="field"><label for="contact-email">Email</label><input id="contact-email" v-model="values.email" data-testid="contact-email" name="email" type="email" /><span v-if="errors.email" class="error" data-testid="field-error">{{ errors.email }}</span></div>
      <div class="field"><label for="contact-message">Message</label><textarea id="contact-message" v-model="values.message" data-testid="contact-message" name="message"></textarea><span v-if="errors.message" class="error" data-testid="field-error">{{ errors.message }}</span></div>
      <button class="button" data-testid="contact-submit" type="submit">Send message</button>
      <p v-if="success" class="success" data-testid="form-success" role="status">Message sent. Thank you!</p>
    </form>
  </main>
</template>
