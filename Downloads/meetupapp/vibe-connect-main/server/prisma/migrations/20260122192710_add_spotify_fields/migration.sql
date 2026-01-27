-- AlterTable
ALTER TABLE "users" ADD COLUMN     "spotifyAccessToken" TEXT,
ADD COLUMN     "spotifyConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "spotifyLastTrack" JSONB,
ADD COLUMN     "spotifyRefreshToken" TEXT;
