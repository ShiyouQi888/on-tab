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
    // 注销时不一定要清除本地所有数据，但可以根据需求选择是否清空
    // 如果是多用户设备，建议清空或在查询时严格过滤 userId
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
