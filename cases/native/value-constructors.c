/* Verify generated value construction and namespace customization from a C host. */
#define _POSIX_C_SOURCE 200809L
#define _XOPEN_SOURCE 700
#include "explicit.h"
#include <math.h>
#define main MINI_ID(generated_main)
#include "generated.c"
#undef main

static const MINI_ID(params) empty_static = MINI_PARAMS(0, NULL);

static const MINI_ID(value) sample_boolean = MINI_VALUE_BOOLEAN(1);

static const MINI_ID(value) sample_number = MINI_VALUE_NUMBER(9007199254740991.0);

static const unsigned char sample_bytes[] = { 'o', 'k' };
static MINI_ID(text_buffer) sample_buffer = {0};
static const MINI_ID(value) sample_static = MINI_VALUE_TEXT(&sample_buffer, 0, 2);

static int sample_text(MINI_ID(value) value) {
    return value.kind == MINI_ID(kind_text)
        && value.text.length == 2
        && value.text.buffer->items[value.text.offset] == 'o'
        && value.text.buffer->items[value.text.offset + 1] == 'k';
}

int main(int argc, char **argv) {
    MINI_ID(vec) numbers = {0};
    MINI_ID(vec_init)(&numbers, sizeof(int));
    for (int index = 0; index < 100; ++index) MINI_ID(vec_append)(&numbers, &index, 1);
    int *number_items = (int *)numbers.items;
    if (numbers.count != 100 || number_items[0] != 0 || number_items[99] != 99
        || numbers.capacity < numbers.count) return 23;
    MINI_ID(vec_append)(&numbers, numbers.items, numbers.count);
    number_items = (int *)numbers.items;
    if (numbers.count != 200 || number_items[100] != 0 || number_items[199] != 99) return 24;
    MINI_ID(vec_free)(&numbers);
    if (numbers.items || numbers.count || numbers.capacity || numbers.item_size) return 25;
    if (empty_static.count != 0 || empty_static.args != NULL) return 19;
    MINI_ID(value) parameter_values[] = { MINI_VALUE_NUMBER(1) };
    size_t parameter_count = 0;
    MINI_ID(params) once_params = (MINI_ID(params)) MINI_PARAMS(++parameter_count, parameter_values);
    if (parameter_count != 1 || once_params.count != 1 || once_params.args != parameter_values) return 20;
    MINI_ID(params) made_params = MINI_ID(params_make)(1, parameter_values);
    if (made_params.count != 1 || made_params.args != parameter_values) return 21;
    int boolean_count = 0;
    MINI_ID(value) boolean_once = (MINI_ID(value)) MINI_VALUE_BOOLEAN(++boolean_count);
    if (sample_boolean.kind != MINI_ID(kind_boolean) || sample_boolean.boolean != 1
        || boolean_count != 1 || boolean_once.boolean != 1
        || MINI_ID(value_boolean)(0).boolean != 0 || MINI_ID(value_boolean)(3).boolean != 1) return 22;
    if (sample_number.kind != MINI_ID(kind_number) || sample_number.number != 9007199254740991.0) return 12;
    MINI_ID(number) numeric_count = 0;
    MINI_ID(value) numeric_once = (MINI_ID(value)) MINI_VALUE_NUMBER(++numeric_count);
    if (numeric_count != 1 || numeric_once.number != 1) return 13;
    MINI_ID(value) constructed_number = MINI_ID(value_number)(-42);
    if (constructed_number.kind != MINI_ID(kind_number) || constructed_number.number != -42) return 14;
    if (MINI_ID(io_write)((MINI_ID(params)) MINI_PARAMS(0, NULL))) return 16;
    if (MINI_ID(io_write)((MINI_ID(params)) MINI_PARAMS(1, NULL)) != 1) return 18;
    MINI_ID(value) hidden_numbers[] = {
        MINI_VALUE_NUMBER(0.5), MINI_VALUE_NUMBER(NAN), MINI_VALUE_NUMBER(INFINITY),
        MINI_VALUE_NUMBER(9007199254740992.0), MINI_VALUE_NUMBER(-9007199254740992.0)
    };
    if (MINI_ID(io_write)((MINI_ID(params)) MINI_PARAMS(5, hidden_numbers))) return 15;
    MINI_ID(value) invalid_arguments[] = { MINI_VALUE_TEXT(NULL, 0, 1), MINI_VALUE_NUMBER(42) };
    if (MINI_ID(io_write)((MINI_ID(params)) MINI_PARAMS(2, invalid_arguments)) != 1) return 17;
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
    if (!sample_text(sample_static) || sample_buffer.capacity < sample_buffer.count
        || offset_view.text.buffer->items[offset_view.text.offset] != 'k') return 7;
    size_t length = sample_buffer.count;
    if (MINI_ID(text_buffer_append)(&sample_buffer, sample_buffer.items, length)) return 8;
    if (sample_buffer.count != length * 2 || sample_buffer.items[length] != 'o') return 9;
    length = sample_buffer.count;
    if (!MINI_ID(text_buffer_append)(&sample_buffer, sample_bytes, SIZE_MAX)
        || sample_buffer.count != length) return 10;
    MINI_ID(text_buffer_free)(&sample_buffer);
    if (sample_buffer.items || sample_buffer.count || sample_buffer.capacity) return 11;
    MINI_ID(text_buffer_free)(&sample_buffer);
    return MINI_ID(generated_main)(argc, argv);
}
