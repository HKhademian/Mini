/* Verify generated value construction and namespace customization from a C host. */
#include "explicit.h"
#include <math.h>
#define main MINI_ID(generated_main)
#include "generated.c"
#undef main

static const MINI_ID(value) sample_number = MINI_VALUE_NUMBER(9007199254740991.0);

static const unsigned char sample_bytes[] = { 'o', 'k' };
static MINI_ID(text_buffer) sample_buffer = {0};
static const MINI_ID(value) sample_static = MINI_VALUE_TEXT(&sample_buffer, 0, 2);

static int sample_text(MINI_ID(value) value) {
    return value.kind == MINI_ID(kind_text)
        && value.text.length == 2
        && value.text.buffer->data[value.text.offset] == 'o'
        && value.text.buffer->data[value.text.offset + 1] == 'k';
}

int main(void) {
    if (sample_number.kind != MINI_ID(kind_number) || sample_number.number != 9007199254740991.0) return 12;
    MINI_ID(number) numeric_count = 0;
    MINI_ID(value) numeric_once = (MINI_ID(value)) MINI_VALUE_NUMBER(++numeric_count);
    if (numeric_count != 1 || numeric_once.number != 1) return 13;
    MINI_ID(value) constructed_number = MINI_ID(value_number)(-42);
    if (constructed_number.kind != MINI_ID(kind_number) || constructed_number.number != -42) return 14;
    if (MINI_ID(io_write)(MINI_ID(value_number)(0.5))
        || MINI_ID(io_write)(MINI_ID(value_number)(NAN))
        || MINI_ID(io_write)(MINI_ID(value_number)(INFINITY))
        || MINI_ID(io_write)(MINI_ID(value_number)(9007199254740992.0))
        || MINI_ID(io_write)(MINI_ID(value_number)(-9007199254740992.0))) return 15;
    if (MINI_ID(text_buffer_append)(&sample_buffer, sample_bytes, 2)) return 5;
    if (!sample_text(sample_static)) return 1;
    if (!sample_text(MINI_ID(value_text)(&sample_buffer, 0, 2))) return 2;
    if (!sample_text((MINI_ID(value)) MINI_VALUE_TEXT(&sample_buffer, 0, 2))) return 3;
    size_t count = 0;
    MINI_ID(value) once = (MINI_ID(value)) MINI_VALUE_TEXT(&sample_buffer, 0, ++count);
    if (count != 1 || once.text.length != 1) return 4;
    unsigned char extra[128] = {0};
    MINI_ID(value) offset_view = MINI_ID(value_text)(&sample_buffer, 1, 1);
    if (MINI_ID(text_buffer_append)(&sample_buffer, extra, sizeof extra)) return 6;
    if (!sample_text(sample_static) || sample_buffer.capacity < sample_buffer.length
        || offset_view.text.buffer->data[offset_view.text.offset] != 'k') return 7;
    size_t length = sample_buffer.length;
    if (MINI_ID(text_buffer_append)(&sample_buffer, sample_buffer.data, length)) return 8;
    if (sample_buffer.length != length * 2 || sample_buffer.data[length] != 'o') return 9;
    length = sample_buffer.length;
    if (!MINI_ID(text_buffer_append)(&sample_buffer, sample_bytes, SIZE_MAX)
        || sample_buffer.length != length) return 10;
    MINI_ID(text_buffer_free)(&sample_buffer);
    if (sample_buffer.data || sample_buffer.length || sample_buffer.capacity) return 11;
    MINI_ID(text_buffer_free)(&sample_buffer);
    return MINI_ID(generated_main)();
}
