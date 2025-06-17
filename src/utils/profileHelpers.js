import { updateEmailSubscription, uploadAvatar } from "./api";

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const submitAvatar = async ({ avatarFile, user, isPerson, favoriteColor }) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);
  formData.append("userId", user.id);
  formData.append("isPerson", isPerson);
  formData.append("favoriteColor", favoriteColor);

  return await uploadAvatar(formData, user.token);
};

export const saveEmailSubscription = async (userId, email, subscribe) => {
  return await updateEmailSubscription(userId, { email, subscribe });
};