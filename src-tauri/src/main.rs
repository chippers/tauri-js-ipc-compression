// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs::File, io::BufReader};

use tauri::Window;

#[rustfmt::skip]
const TABLE: [&str; 85] = [
    "0", "1,", "2", "3", "4", "5", "6", "7", "8", "9",
    "a", "b,", "c", "d", "e", "f", "g", "h", "i", "j",
    "k", "l,", "m", "n", "o", "p", "q", "r", "s", "t",
    "u", "v,", "w", "x", "y", "z", "A", "B", "C", "D",
    "E", "F,", "G", "H", "I", "J", "K", "L", "M", "N",
    "O", "P,", "Q", "R", "S", "T", "U", "V", "W", "X",
    "Y", "Z,", ".", "-", ":", "+", "=", "^", "!", "/",
    "*", "?,", "&", "<", ">", "(", ")", "[", "]", "{",
    "}", "@,", "%", "$", "#",
];

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn read_z85(window: Window) {
    let content = std::fs::read("/Users/chip/Documents/1g.bin").unwrap();
    dbg!(content.len());

    let mut out = String::new();
    out.push_str("window._z85('");
    let chunks = content.chunks_exact(4);
    let remainder = dbg!(chunks.remainder());
    for chunk in chunks {
        let mut raw = u32::from_be_bytes(chunk.try_into().unwrap());
        for _ in 0..5 {
            let char = raw % 85;
            out.push_str(TABLE[char as usize]);
            raw /= 85;
        }
    }

    let remainder = serde_json::to_string(remainder).unwrap();
    out.push_str("',");
    out.push_str(&remainder);
    out.push_str(")");

    window.eval(&out).unwrap();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_z85])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
