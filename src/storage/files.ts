import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export class FileStorage {
  static async writeFile(path: string, data: string): Promise<void> {
    await Filesystem.writeFile({
      path,
      data,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
  }

  static async readFile(path: string): Promise<string> {
    const result = await Filesystem.readFile({
      path,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
    return result.data as string;
  }

  static async fileExists(path: string): Promise<boolean> {
    try {
      await Filesystem.stat({
        path,
        directory: Directory.Data
      });
      return true;
    } catch {
      return false;
    }
  }

  static async deleteFile(path: string): Promise<void> {
    await Filesystem.deleteFile({
      path,
      directory: Directory.Data
    });
  }

  static async mkdir(path: string): Promise<void> {
    try {
      await Filesystem.mkdir({
        path,
        directory: Directory.Data,
        recursive: true
      });
    } catch {
      // Directory might already exist
    }
  }

  static async shareFile(path: string, title: string): Promise<void> {
    const fileUri = await Filesystem.getUri({
      directory: Directory.Data,
      path
    });

    await Share.share({
      title,
      url: fileUri.uri
    });
  }
}