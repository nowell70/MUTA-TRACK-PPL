# MutaTrack — Integrated Variant Calling Platform

[![Live Website](https://img.shields.io/badge/Live%20Website-nowell70.github.io%2FMUTA--TRACK--PPL-0d9488?style=for-the-badge&logo=github&logoColor=white)](https://nowell70.github.io/MUTA-TRACK-PPL/)
[![Pipeline](https://img.shields.io/badge/Pipeline-GATK%204.5%20Best%20Practices-blue?style=for-the-badge&logo=snakemake)](https://github.com/snakemake-workflows/dna-seq-gatk-variant-calling)
[![License](https://img.shields.io/badge/License-Apache%202.0-green?style=for-the-badge)](LICENSE)

---

## 🌐 Live Web Application

Aplikasi MutaTrack dapat langsung diakses secara online melalui tautan resmi GitHub Pages berikut:
👉 **[https://nowell70.github.io/MUTA-TRACK-PPL/](https://nowell70.github.io/MUTA-TRACK-PPL/)**

> **Cara Mengaktifkan GitHub Pages di Repository Ini (Hanya 1 Kali):**
> 1. Buka tab **Settings** di repository GitHub Anda (`https://github.com/nowell70/MUTA-TRACK-PPL/settings/pages`).
> 2. Pada menu kiri, klik **Pages**.
> 3. Di bawah judul **Build and deployment** > **Source**, pilih opsi **GitHub Actions**.
> 4. Jalankan `git push origin main`. Workflow otomatis (`.github/workflows/deploy.yml`) akan langsung mem-build dan menayangkan website Anda di URL di atas dalam ~1 menit!
> 5. Untuk memasang tautan website di header repository (kolom **About**): klik ikon **⚙️ Edit** di sebelah kanan About, lalu tempelkan link `https://nowell70.github.io/MUTA-TRACK-PPL/` pada kolom Website dan klik Save.

---

## 🔬 Deskripsi Singkat

**MutaTrack** adalah aplikasi bioinformatika berbasis web terintegrasi yang dirancang untuk menyederhanakan alur analisis *variant calling* DNA-seq (Next-Generation Sequencing). Aplikasi ini mentransformasikan alur kerja bioinformatika tradisional yang biasanya berbasis perintah command-line manual menjadi antarmuka visual interaktif di mana pengguna (*Pengguna Analisis*) dapat:

- Mengunggah file FASTQ berpasangan (R1 & R2)
- Melakukan verifikasi validitas file input secara otomatis (*Input Validation Matrix*)
- Mengonfigurasi parameter analisis (GATK HaplotypeCaller, Mapping Quality, Base Quality, Read Depth, Database Anotasi)
- Menjalankan analisis dan memantau progres eksekusi secara *real-time* dengan log proses
- Menganalisis hasil pada satu dashboard terpadu (**Single Canvas**)
- Mengunduh file output berupa **VCF v4.2**, **CSV**, dan **Laporan PDF Genomik**

Aplikasi ini menggunakan alur referensi teknis terstandar dari **[Snakemake DNA-seq GATK Variant Calling Workflow](https://github.com/snakemake-workflows/dna-seq-gatk-variant-calling)**.

---

## 🌟 Fitur Utama

1. **Sistem Login & Verifikasi Gmail (OTP Code)**
   - Login akun dengan persona *Pengguna Analisis*.
   - Verifikasi dua langkah melalui kode autentikasi 6 digit yang dikirimkan ke Gmail pengguna (misal: `noelbioinfnoel@apps.ipb.ac.id`).
   - Notifikasi interaktif untuk menyalin dan memasukkan kode verifikasi secara cepat.
2. **Mode Gelap / Terang (Light & Dark Mode)**
   - Opsi tampilan tema terang (*Light Mode*) yang bersih dan ramah mata untuk dokumentasi, serta tema gelap (*Dark Mode*) berpresisi tinggi untuk analisis genomik.
   - Pilihan tema tersimpan secara persisten di *local storage*.
3. **Single Canvas Dashboard**
   - FASTQ Quality (FastQC Q30 Score, GC Content, Kurva Phred Per-Base)
   - Adapter Trimming (Cutadapt)
   - BWA-MEM Alignment & Read Depth
   - BAM Processing & Picard Duplication
   - GATK HaplotypeCaller Variant Calling & Ti/Tv Ratio
   - GATK VariantFiltration Pass Rate
   - SnpEff & ClinVar Functional Annotation
4. **Tabel Varian Interaktif**
   - Pencarian berdasarkan gen, kromosom, posisi, dan konsekuensi molekuler.
   - Filter dampak fungsional: `HIGH`, `MODERATE`, `LOW`, `MODIFIER`.
   - Inspektur detail varian untuk notasi HGVS coding/protein dan signifikansi klinis ClinVar.
5. **Ekspor Data Lengkap**
   - Unduh VCF standar v4.2.
   - Unduh CSV tabel varian.
   - Cetak / Simpan Laporan Genomik PDF Klinis resmi.

---

## 🛠️ Menjalankan Secara Lokal

```bash
# Clone repository
git clone https://github.com/username/mutatrack.git
cd mutatrack

# Install dependencies
npm install

# Jalankan server pengembangan
npm run dev
```

Buka `http://localhost:3000` pada browser Anda.

---

## 🚀 Build Produksi

```bash
npm run build
```

Hasil build akan berada di direktori `dist/` dan siap di-deploy ke platform hosting seperti GitHub Pages, Cloud Run, Vercel, atau Netlify.
