import { supabase } from './supabase';

export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /** 发送密码重置邮件 */
  async resetPasswordForEmail(email: string) {
    const redirectTo = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
  },

  async getCurrentUser() {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        // 尝试从 user_metadata 获取头像
        const avatarUrl = data.user.user_metadata?.avatar_url;
        if (!avatarUrl) {
          // 如果没有头像，设置一个默认头像
          const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`;
          await this.updateProfile({ avatar_url: defaultAvatar });
          data.user.user_metadata = { ...data.user.user_metadata, avatar_url: defaultAvatar };
        }
      }
      return data?.user ?? null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  async updateProfile(metadata: Record<string, any>) {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    });
    if (error) throw error;
    return data;
  },

  async getEffectiveUserId() {
    const user = await this.getCurrentUser();
    return user?.id || 'local-user';
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
