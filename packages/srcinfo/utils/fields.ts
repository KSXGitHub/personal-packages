export const requiredFields = [
  'pkgname',
  'pkgver',
  'pkgrel',
] as const

export const partialFields = [
  'epoch',
  'pkgdesc',
  'url',
  'install',
  'changelog',
] as const

export const arrayFields = [
  'arch',
  'groups',
  'license',
  'noextract',
  'options',
  'backup',
  'validgpgkeys',
  'source',
  'depends',
  'checkdepends',
  'makedepends',
  'optdepends',
  'provides',
  'conflicts',
  'replaces',
  'md5sums',
  'sha1sums',
  'sha224sums',
  'sha256sums',
  'sha348sums',
  'sha512sums',
] as const
